"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { uploadAdminDisputeEvidence } from "@/lib/actions/admin-disputes";
import { validateDocumentFile, formatBytes } from "@/lib/verification/documents/policy";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DisputeEvidenceUpload({ disputeId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setIsValidating(true);
    setValidationError("");

    // Run magic byte & policy validation matching #233 verification standards
    const validation = await validateDocumentFile(selected, {
      maxBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    });

    setIsValidating(false);

    if (!validation.valid) {
      setValidationError(validation.error || "File policy validation failed.");
      setFile(null);
      return;
    }

    setFile(selected);
    setValidationError("");
  };

  const handleClearFile = () => {
    setFile(null);
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !note.trim()) {
      toast.error("Please add a note or attach an evidence file.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAdminDisputeEvidence(disputeId, {
        file,
        note: note.trim(),
        senderRole: "admin",
      });

      if (result.success && result.evidence) {
        toast.success("Admin evidence attached successfully!");
        setFile(null);
        setNote("");
        setValidationError("");
        if (onUploadSuccess) {
          onUploadSuccess(result.evidence);
        }
      } else {
        toast.error(result.error || "Failed to attach evidence");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("An error occurred while uploading evidence");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border border-dashed shadow-none bg-muted/20">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Attach Admin Evidence & Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Note Input */}
          <div className="space-y-1">
            <label htmlFor="adminNote" className="text-xs font-medium text-muted-foreground">
              Internal Admin Note / Remarks
            </label>
            <Textarea
              id="adminNote"
              placeholder="Provide context or findings regarding this dispute resolution..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* File Upload Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Attachment File (PDF, PNG, JPEG up to 10MB)
            </label>

            {!file ? (
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-3 hover:border-primary/50 transition-colors bg-card cursor-pointer">
                <input
                  type="file"
                  id="evidenceFileInput"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isValidating || isUploading}
                />
                <label
                  htmlFor="evidenceFileInput"
                  className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Validating file signature...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-primary" />
                      <span>Click to select PDF, PNG, or JPEG file</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatBytes(file.size)} &middot; {file.type || "unknown"}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-red-500"
                  onClick={handleClearFile}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {validationError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || isValidating || (!file && !note.trim())}
              className="text-xs gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Attaching...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Attach Evidence</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
