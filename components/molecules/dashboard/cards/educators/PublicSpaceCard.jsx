"use client";

import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import { VideoIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const PublicSpaceCard = ({ space }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    category,
    status,
    eventDate,
    duration,
  } = space;

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0
      ? `${hours} hr${hours > 1 ? "s" : ""}`
      : `${hours} hr${hours > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  }

  const formattedTime = eventDate ? format(new Date(eventDate), "PPpp") : "TBD";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={thumbnail || "/images/space-placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          {category && (
            <span
              className={cn(
                poppins_600,
                "rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-wider text-accent shadow"
              )}
            >
              {category}
            </span>
          )}
          {status && (
            <span
              className={cn(
                poppins_600,
                "rounded-full bg-gradient-to-r from-secondary to-highlight px-3 py-1 text-[11px] uppercase text-white shadow"
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className={cn(poppins_600, "line-clamp-1 text-base text-ink")}>
          {title}
        </h3>
        <p
          className={cn(
            poppins_400,
            "mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted"
          )}
        >
          {description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className={cn(
              poppins_400,
              "flex items-center gap-1.5 text-xs text-ink-muted"
            )}
          >
            <Clock className="h-4 w-4 text-accent" />
            {formattedTime}
          </span>
          {duration && (
            <span
              className={cn(
                poppins_600,
                "shrink-0 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs text-accent"
              )}
            >
              {formatDuration(duration)}
            </span>
          )}
        </div>

        <Button
          wide
          round
          className={cn(
            poppins_500,
            "mt-4 w-full gap-2 bg-accent text-sm text-white hover:bg-highlight"
          )}
          to={`/dashboard/spaces/${_id}`}
        >
          <VideoIcon className="h-4 w-4" />
          View Space
        </Button>
      </div>
    </div>
  );
};

export default PublicSpaceCard;
