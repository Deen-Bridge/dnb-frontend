"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadReel } from "@/lib/actions/reels-action";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 200;
const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const ReelUploadDialog = ({ open, onOpenChange, onUploaded }) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setDescription("");
      setCategory("");
      setTags("");
      setVideoFile(null);
      setError("");
      setSubmitting(false);
      setDragging(false);
    }
  }, [open]);

  const videoPreview = useMemo(() => {
    if (!videoFile) return null;
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const validateFile = (file) => {
    if (!file) return "Please select a video file.";
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported video format. Please upload MP4, MOV, or WEBM.";
    }
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > MAX_FILE_SIZE_MB) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileChange = (file) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setVideoFile(file);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please provide a description for your reel.");
      return;
    }
    if (!videoFile) {
      setError("Please upload a video file.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      if (category.trim()) {
        formData.append("category", category.trim());
      }
      if (tags.trim()) {
        formData.append("tags", tags.trim());
      }
      formData.append("video", videoFile);

      const response = await uploadReel(formData);
      if (response?.success) {
        toast.success("Reel uploaded successfully!");
        onUploaded?.(response.reel);
        onOpenChange(false);
      } else {
        toast.error(response?.message || "Failed to upload reel.");
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "Failed to upload reel."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden px-0 pb-0 pt-6 sm:max-w-2xl">
        <DialogHeader className="px-6">
          <DialogTitle className="text-xl font-semibold">
            Share a New Reel
          </DialogTitle>
          <DialogDescription>
            Upload an inspirational clip to spark the community.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 overflow-y-auto px-6 pb-6 pt-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-muted/60 transition",
              dragging ? "border-accent bg-accent/10" : "border-muted-foreground/40"
            )}
          >
            {videoPreview ? (
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <video
                  src={videoPreview}
                  className="h-full w-full object-cover"
                  controls
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  onClick={() => setVideoFile(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Drag & drop your reel here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV or WEBM up to {MAX_FILE_SIZE_MB}MB
                  </p>
                </div>
                <Label
                  htmlFor="reel-video-input"
                  className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-highlight"
                >
                  Browse files
                </Label>
                <Input
                  id="reel-video-input"
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                />
              </>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reel-description">Description</Label>
              <Textarea
                id="reel-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Share context, reflections, or key takeaways..."
                rows={4}
                className="bg-muted/60"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reel-category">Category</Label>
                <Input
                  id="reel-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="e.g. Spirituality, Education"
                  className="bg-muted/60"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reel-tags">Tags</Label>
                <Input
                  id="reel-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="Comma separated (e.g. ramadan, tasbeeh)"
                  className="bg-muted/60"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="border-t border-border bg-muted/60 px-6 py-4">
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              outlined
              round
              className="text-normal"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              round
              className="bg-accent text-white"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting || !videoFile || !description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                "Share Reel"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReelUploadDialog;

