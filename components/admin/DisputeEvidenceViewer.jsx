"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { fetchDisputeEvidenceSignedUrl } from "@/lib/actions/admin-disputes";
import { formatBytes } from "@/lib/verification/documents/policy";
import { cn } from "@/lib/utils";

export default function DisputeEvidenceViewer({
  disputeId,
  evidence,
  open,
  onOpenChange,
}) {
  const [signedUrl, setSignedUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [timeLeftStr, setTimeLeftStr] = useState("");

  // Lightbox state for images
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFit, setIsFit] = useState(true);

  // Fetch or refresh short-lived signed URL
  const loadSignedUrl = useCallback(async () => {
    if (!disputeId || !evidence?.id) return;
    setIsLoadingUrl(true);
    setUrlError("");

    const result = await fetchDisputeEvidenceSignedUrl(disputeId, evidence.id);
    if (result.success && result.signedUrl) {
      setSignedUrl(result.signedUrl);
      setExpiresAt(result.expiresAt || "");
    } else {
      setUrlError(result.error || "Failed to obtain secure URL for attachment");
      // Fallback to static URL if present
      if (evidence.url || evidence.signedUrl) {
        setSignedUrl(evidence.url || evidence.signedUrl);
      }
    }
    setIsLoadingUrl(false);
  }, [disputeId, evidence]);

  useEffect(() => {
    if (open && evidence) {
      setScale(1);
      setRotation(0);
      setIsFit(true);
      if (evidence.signedUrl && evidence.expiresAt) {
        setSignedUrl(evidence.signedUrl);
        setExpiresAt(evidence.expiresAt);
      } else {
        loadSignedUrl();
      }
    }
  }, [open, evidence, loadSignedUrl]);

  // Expiration countdown timer
  useEffect(() => {
    if (!expiresAt) {
      setTimeLeftStr("");
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr("Expired");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetImage = () => {
    setScale(1);
    setRotation(0);
    setIsFit(true);
  };

  const isPdf =
    evidence?.fileType === "application/pdf" ||
    evidence?.fileName?.toLowerCase().endsWith(".pdf");

  const isImage =
    evidence?.fileType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(evidence?.fileName || "");

  const roleColors = {
    buyer: "bg-blue-100 text-blue-800 border-blue-200",
    educator: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[92vw] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border shadow-xl">
        {/* Header Bar */}
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-muted/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              {isPdf ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <ImageIcon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold truncate">
                {evidence?.fileName || "Dispute Evidence Attachment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>Uploaded by</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold py-0 px-1.5",
                    roleColors[evidence?.senderRole] || "bg-gray-100 text-gray-800"
                  )}
                >
                  {evidence?.senderRole || "Party"}
                </Badge>
                {evidence?.uploadedAt && (
                  <span>
                    &middot; {new Date(evidence.uploadedAt).toLocaleString()}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Expiring Security Banner */}
          <div className="flex items-center gap-2 pr-6">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-medium">Expiring URL</span>
              {timeLeftStr && (
                <span className="font-mono text-[11px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.2 rounded font-semibold ml-1">
                  {timeLeftStr}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={loadSignedUrl}
              disabled={isLoadingUrl}
              title="Refresh expiring URL"
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingUrl && "animate-spin")} />
            </Button>
          </div>
        </DialogHeader>

        {/* Note context if provided */}
        {evidence?.note && (
          <div className="px-4 py-2.5 bg-muted/20 border-b text-xs text-foreground flex items-start gap-2">
            <span className="font-semibold text-muted-foreground shrink-0">
              Note:
            </span>
            <p className="italic">{evidence.note}</p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative bg-black/95 dark:bg-black/90 min-h-[400px] flex items-center justify-center overflow-hidden">
          {isLoadingUrl ? (
            <div className="flex flex-col items-center gap-3 text-white">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Fetching secure attachment URL...</p>
            </div>
          ) : urlError && !signedUrl ? (
            <div className="text-center p-6 text-red-400 max-w-md">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">{urlError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs text-white border-white/20 hover:bg-white/10"
                onClick={loadSignedUrl}
              >
                Try Again
              </Button>
            </div>
          ) : isPdf ? (
            /* PDF Inline Viewer */
            <div className="w-full h-[65vh] flex flex-col bg-slate-900">
              <iframe
                src={signedUrl}
                title={evidence?.fileName || "PDF Evidence"}
                className="w-full h-full border-none"
              />
            </div>
          ) : isImage ? (
            /* Image Lightbox Viewer */
            <div className="relative w-full h-[65vh] flex items-center justify-center p-4 overflow-hidden select-none">
              <img
                src={signedUrl}
                alt={evidence?.fileName || "Evidence Screenshot"}
                className="transition-transform duration-200 ease-out object-contain max-h-full max-w-full"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          ) : (
            /* Generic File Download Fallback */
            <div className="text-center p-8 text-white max-w-sm">
              <FileText className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="font-semibold text-sm">{evidence?.fileName}</p>
              <p className="text-xs text-white/60 mt-1 mb-4">
                Preview not directly supported for file type: {evidence?.fileType || "unknown"}
              </p>
              {signedUrl && (
                <Button asChild variant="default" size="sm">
                  <a href={signedUrl} download={evidence?.fileName} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="p-3 border-t bg-card flex flex-wrap items-center justify-between gap-3">
          {/* Lightbox controls for images */}
          {isImage && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>

              <span className="text-xs font-mono w-12 text-center text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 ml-1"
                onClick={handleRotate}
                title="Rotate 90 degrees"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Rotate
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground"
                onClick={handleResetImage}
                title="Reset view"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          )}

          {/* External Download Link */}
          {signedUrl && (
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
                <a href={signedUrl} target="_blank" rel="noopener noreferrer" download={evidence?.fileName}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
