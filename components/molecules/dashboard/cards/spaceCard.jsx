"use client";

import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { VideoIcon, Clock, CirclePlus, Flag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const SpaceCard = ({ space }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    category,
    status,
    eventDate,
    duration,
    host,
  } = space;
  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0
      ? `${hours} hr${hours > 1 ? "s" : ""}`
      : `${hours} hr${hours > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  }
  const formattedTime = format(new Date(eventDate), "PPpp");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-60 w-full overflow-hidden">
        <Image
          src={thumbnail || "/images/space-placeholder.jpg"}
          alt={title}
          fill
          className="rounded-t-2xl border-b border-accent/10 object-cover shadow-sm transition-transform duration-500 will-change-transform group-hover:scale-110"
          priority
          style={{ maxHeight: '15rem' }} // Ensures the image never exceeds the container height
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {/* Category + Status */}
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category && (
              <span
                className={cn(
                  poppins_600,
                  "rounded-full border border-accent/15 bg-surface-raised/80 px-3 py-1 text-xs uppercase tracking-wider text-ink shadow-sm"
                )}
              >
                {category}
              </span>
            )}
            {space.flagCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                <Flag className="h-3 w-3" />
                {space.flagCount}
              </span>
            )}
          </div>
          {status && (
            <div
              className={cn(
                poppins_500,
                "rounded-full bg-gradient-to-r from-secondary to-accent px-3 py-1 text-xs text-white shadow-sm"
              )}
            >
              🟢 {status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* New Layout: Host, Title, Description, Meta, Button */}
      <div className="flex flex-1 flex-col gap-3 px-6 py-4">

        {/* Title & Description */}
        <div className="mb-2">
          <h3
            className={cn(
              poppins_600,
              "mb-1 line-clamp-1 text-lg text-ink"
            )}
          >
            {title}
          </h3>
          <p className={cn(poppins_400, "line-clamp-2 text-sm text-ink-muted")}>
            {description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="mb-4 mt-2 flex items-center justify-between gap-4">
          <div
            className={cn(
              poppins_400,
              "flex items-center gap-2 text-xs text-ink-muted"
            )}
          >
            <Clock className="h-4 w-4 text-accent" />
            <span className={cn(poppins_500, "text-ink")}>{formattedTime}</span>
          </div>
          <div
            className={cn(
              poppins_600,
              "rounded-full bg-gradient-to-r from-highlight to-accent px-2 py-0.5 text-xs text-white shadow-sm"
            )}
          >
            {formatDuration(duration)}
          </div>
        </div>
        {/* Host */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link
            href={host?._id ? `/educators/${host._id}` : "#"}
            className="flex items-center gap-2"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={host?.avatar || "/images/avatar-placeholder.png"}
                alt={host?.name}
              />
              <AvatarFallback className="rounded-xl">
                {host?.name?.slice(0, 2).toUpperCase() || "HN"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className={cn(poppins_600, "text-base leading-tight text-ink")}>{host?.name || "Ustadh Ahmad"}</span>
              <span className={cn(poppins_400, "text-xs text-ink-muted")}>Host</span>
            </div>
          </Link>

          <div>
            <CirclePlus className="h-5 w-5 rounded-full p-1 text-accent transition hover:bg-accent hover:text-white sm:h-8 sm:w-8" />
          </div>

        </div>

        {/* CTA Button */}
        <Button
          wide
          round
          className={cn(
            poppins_600,
            "mt-auto w-full bg-gradient-to-r from-highlight to-accent py-3 text-base text-white shadow-sm transition-all hover:brightness-110"
          )}
          to={`/dashboard/spaces/${_id}`}
        >
          <VideoIcon className="mr-2 h-5 w-5" />
          View Space
        </Button>
      </div>
    </div>
  );
};




export default SpaceCard;
