"use client";
/**
 * ReelPosterDialog - admin poster (cover image) management for a reel (#265).
 * ---------------------------------------------------------------------------
 * Two ways to set a reel's poster:
 *   1. "Pick a frame" - scrub the reel's own video with a slider, capture the
 *      currently-displayed frame to a <canvas>, convert it to a Blob, and
 *      upload that still to Cloudinary.
 *   2. "Upload image" - pick a custom image file directly.
 *
 * Both paths converge on the same unsigned Cloudinary upload
 * (`dnb_reels_posters` preset, matching the `dnb_*` naming used by course
 * thumbnails) and then persist the resulting URL via `useReelPoster`, which
 * updates instantly and rolls back + toasts if the (stubbed) backend call
 * fails - see `lib/actions/reels-action.updateReelPoster`.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Button from "@/components/atoms/form/Button";
import useReelPoster from "@/hooks/useReelPoster";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Loader2, ImageIcon, Film } from "lucide-react";
import { toast } from "sonner";

const POSTER_UPLOAD_PRESET = "dnb_reels_posters";
const POSTER_VALIDATION = {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/*"],
};

/**
 * Draw the current frame of a <video> element onto an offscreen <canvas> and
 * resolve a JPEG Blob of it.
 * @param {HTMLVideoElement} video
 * @returns {Promise<Blob>}
 */
export function captureVideoFrame(video) {
  return new Promise((resolve, reject) => {
    if (!video || !video.videoWidth || !video.videoHeight) {
      reject(new Error("Video isn't ready to capture yet."));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas isn't supported in this browser."));
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Couldn't capture that frame. Try again."));
      },
      "image/jpeg",
      0.92
    );
  });
}

const ReelPosterDialog = ({ open, onOpenChange, reel, onUpdated }) => {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [capturing, setCapturing] = useState(false);

  const { setPoster, isPending: persisting } = useReelPoster(
    reel?.id,
    reel?.poster
  );
  const frameUpload = useCloudinaryUpload(POSTER_UPLOAD_PRESET, POSTER_VALIDATION);
  const fileUpload = useCloudinaryUpload(POSTER_UPLOAD_PRESET, POSTER_VALIDATION);

  const busy = capturing || frameUpload.uploading || fileUpload.uploading || persisting;

  const resetState = useCallback(() => {
    setScrubTime(0);
    setCapturing(false);
    frameUpload.reset();
    fileUpload.reset();
  }, [frameUpload, fileUpload]);

  const handleOpenChange = (next) => {
    if (!next) resetState();
    onOpenChange(next);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration || 0);
  };

  const handleScrub = (values) => {
    const [time] = values;
    setScrubTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleCaptureAndUpload = async () => {
    const video = videoRef.current;
    setCapturing(true);
    // Capture failures (video not ready, canvas unsupported) don't go
    // through either hook, so they get their own toast here. Everything
    // past this point -- frameUpload.uploadFile and setPoster -- already
    // toasts its own errors internally, so we deliberately don't add a
    // second toast for those; we just stop and leave the dialog open.
    let blob;
    try {
      blob = await captureVideoFrame(video);
    } catch (err) {
      setCapturing(false);
      toast.error(err?.message || "Couldn't capture that frame.");
      return;
    }

    try {
      const file = new File([blob], `reel-${reel.id}-frame.jpg`, {
        type: "image/jpeg",
      });
      const secureUrl = await frameUpload.uploadFile(file);
      await setPoster(secureUrl);
      toast.success("Poster updated from video frame.");
      onUpdated?.(secureUrl);
      handleOpenChange(false);
    } catch {
      // Already toasted by uploadFile or setPoster.
    } finally {
      setCapturing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    // Clear the input immediately so selecting the exact same file again
    // (e.g. retrying after a failed upload) still fires a change event.
    event.target.value = "";
    if (!file) return;
    try {
      const secureUrl = await fileUpload.uploadFile(file);
      await setPoster(secureUrl);
      toast.success("Poster updated.");
      onUpdated?.(secureUrl);
      handleOpenChange(false);
    } catch {
      // Already toasted by uploadFile or setPoster.
    }
  };

  const formattedTime = useMemo(() => {
    const s = Math.floor(scrubTime % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor(scrubTime / 60);
    return `${m}:${s}`;
  }, [scrubTime]);

  if (!reel) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Manage poster
          </DialogTitle>
          <DialogDescription>
            Pick a frame from this reel or upload a custom cover image.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="frame" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="frame">
              <Film className="mr-2 h-4 w-4" aria-hidden="true" />
              Pick a frame
            </TabsTrigger>
            <TabsTrigger value="upload">
              <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              Upload image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frame" className="space-y-4">
            <div className="overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                src={reel.video}
                className="max-h-72 w-full"
                onLoadedMetadata={handleLoadedMetadata}
                muted
                playsInline
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
                {formattedTime}
              </span>
              <Slider
                value={[scrubTime]}
                min={0}
                max={duration || 0}
                step={0.1}
                onValueChange={handleScrub}
                disabled={!duration || busy}
                aria-label="Scrub to a frame"
              />
            </div>
            <Button
              round
              className="w-full bg-accent text-white"
              onClick={handleCaptureAndUpload}
              disabled={!duration || busy}
              loading={capturing || frameUpload.uploading || persisting}
            >
              {capturing || frameUpload.uploading || persisting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting poster...
                </>
              ) : (
                "Use this frame as poster"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reel-poster-upload">Custom cover image</Label>
              <Input
                id="reel-poster-upload"
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                JPG or PNG, up to 5MB.
              </p>
            </div>
            {(fileUpload.uploading || persisting) && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading and setting poster...
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-border pt-4">
          <Button outlined round onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReelPosterDialog;
