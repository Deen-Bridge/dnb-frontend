"use client";
/**
 * ReportedContentPreview — inline preview of a reported item (#289).
 * ---------------------------------------------------------------------------
 * Moderators should never have to leave the report to see what was flagged.
 * This component renders a preview matched to the target's content type so the
 * decision can be made in-context:
 *   - reel   → thumbnail with a play affordance (poster image + play button;
 *              no heavy video-player dependency)
 *   - book   → cover image
 *   - course → compact course card (thumbnail + lesson/enrolment stats)
 *
 * It is presentational and defensive: an unknown type or a missing image falls
 * back to a labelled placeholder rather than breaking the drawer.
 */
import { useState } from "react";
import Image from "next/image";
import { BookOpen, GraduationCap, Play, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Small image with a graceful fallback when the source fails to load. */
function SafeImage({ src, alt, fill, width, height, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-muted text-ink-muted"
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

function ReelPreview({ target }) {
  const { title, author, preview = {} } = target;
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-surface-raised">
      <div className="relative aspect-video w-full bg-muted">
        <SafeImage src={preview.thumbnail || preview.poster} alt={`Thumbnail for reel: ${title}`} fill className="object-cover" />
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/30">
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
          </span>
        </span>
        {typeof preview.durationSeconds === "number" ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {Math.floor(preview.durationSeconds / 60)}:
            {String(preview.durationSeconds % 60).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <figcaption className={cn(poppins_400.className, "flex items-center justify-between gap-2 px-3 py-2")}>
        <span className={cn(poppins_500.className, "truncate text-sm text-ink")}>{title}</span>
        <Badge variant="secondary">Reel</Badge>
      </figcaption>
      <p className={cn(poppins_400.className, "px-3 pb-2 text-xs text-ink-muted")}>by {author}</p>
    </figure>
  );
}

function BookPreview({ target }) {
  const { title, author, preview = {} } = target;
  return (
    <figure className="flex gap-3 rounded-lg border border-border bg-surface-raised p-3">
      <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
        <SafeImage src={preview.cover} alt={`Cover of book: ${title}`} fill className="object-cover" />
      </div>
      <figcaption className="flex min-w-0 flex-col justify-center gap-1">
        <Badge variant="secondary" className="w-fit gap-1">
          <BookOpen className="h-3 w-3" aria-hidden="true" /> Book
        </Badge>
        <span className={cn(poppins_600.className, "line-clamp-2 text-sm text-ink")}>{title}</span>
        <span className={cn(poppins_400.className, "text-xs text-ink-muted")}>by {author}</span>
      </figcaption>
    </figure>
  );
}

function CoursePreview({ target }) {
  const { title, author, preview = {} } = target;
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-surface-raised">
      <div className="relative aspect-video w-full bg-muted">
        <SafeImage src={preview.thumbnail} alt={`Thumbnail for course: ${title}`} fill className="object-cover" />
        <Badge variant="secondary" className="absolute left-2 top-2 gap-1">
          <GraduationCap className="h-3 w-3" aria-hidden="true" /> Course
        </Badge>
      </div>
      <figcaption className="space-y-1 px-3 py-2">
        <span className={cn(poppins_600.className, "block truncate text-sm text-ink")}>{title}</span>
        <span className={cn(poppins_400.className, "block text-xs text-ink-muted")}>by {author}</span>
        <div className={cn(poppins_400.className, "flex gap-3 pt-1 text-xs text-ink-muted")}>
          {typeof preview.lessons === "number" ? <span>{preview.lessons} lessons</span> : null}
          {typeof preview.enrolled === "number" ? <span>{preview.enrolled} enrolled</span> : null}
        </div>
      </figcaption>
    </figure>
  );
}

export default function ReportedContentPreview({ target }) {
  if (!target) return null;
  switch (target.type) {
    case "reel":
      return <ReelPreview target={target} />;
    case "book":
      return <BookPreview target={target} />;
    case "course":
      return <CoursePreview target={target} />;
    default:
      return (
        <div className={cn(poppins_400.className, "rounded-lg border border-border bg-surface-raised p-4 text-sm text-ink-muted")}>
          No preview available for this content type.
        </div>
      );
  }
}
