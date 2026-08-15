"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import {
  Share2,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const StatChip = ({ icon: Icon, value, label, gold }) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur">
    <Icon
      className={cn("h-4 w-4", gold ? "fill-yellow-400 text-yellow-400" : "text-secondary")}
    />
    <span className={cn(poppins_600, "text-sm text-ink-inverse")}>{value}</span>
    <span className={cn(poppins_400, "text-xs text-ink-inverse-muted")}>
      {label}
    </span>
  </div>
);

const EducatorProfileHeader = ({
  educator,
  followersCount,
  avgRating,
  isFollowing,
  followLoading,
  onFollowToggle,
  onShare,
  isOwnProfile,
  stats,
}) => {
  return (
    <div className="relative w-full">
      {/* Cover banner */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-secondary via-highlight to-accent sm:h-56">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-basic/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Avatar */}
        <div className="relative -mt-14 sm:-mt-16">
          <Avatar className="h-28 w-28 border-4 border-basic shadow-2xl sm:h-32 sm:w-32">
            <AvatarImage src={educator?.avatar} alt={educator?.name} />
            <AvatarFallback
              className={cn(poppins_600, "bg-accent text-3xl text-white")}
            >
              {educator?.name?.charAt(0) || "E"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={cn(
                    poppins_600,
                    "text-2xl text-ink-inverse sm:text-3xl"
                  )}
                >
                  {educator?.name}
                </h1>
                {educator?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs text-secondary">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              {educator?.role && (
                <span
                  className={cn(
                    poppins_500,
                    "inline-block rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs capitalize text-ink-inverse-muted"
                  )}
                >
                  {educator.role}
                </span>
              )}
              {educator?.bio && (
                <p
                  className={cn(
                    poppins_400,
                    "max-w-2xl leading-relaxed text-ink-inverse-muted"
                  )}
                >
                  {educator.bio}
                </p>
              )}
              {educator?.createdAt && (
                <p
                  className={cn(
                    poppins_400,
                    "flex items-center gap-1.5 text-xs text-ink-inverse-muted/80"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(educator.createdAt), "MMMM yyyy")}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                round
                className="gap-1.5 border border-white/20 bg-white/5 px-4 text-sm text-ink-inverse hover:bg-white/15"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {isOwnProfile ? (
                <Button to="/profile-setup" round className="bg-white px-5 text-sm text-basic hover:bg-white/90">
                  Edit Profile
                </Button>
              ) : (
                <Button
                  round
                  loading={followLoading}
                  className={cn(
                    "px-6 text-sm",
                    isFollowing
                      ? "border border-white/20 bg-white/5 text-ink-inverse hover:bg-white/15"
                      : "bg-gradient-to-r from-secondary to-highlight text-white hover:from-highlight hover:to-secondary"
                  )}
                  onClick={onFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <StatChip icon={Users} value={followersCount} label="Followers" />
            {stats?.courses > 0 && (
              <StatChip icon={GraduationCap} value={stats.courses} label="Courses" />
            )}
            {stats?.books > 0 && (
              <StatChip icon={BookOpen} value={stats.books} label="Books" />
            )}
            {stats?.spaces > 0 && (
              <StatChip icon={Users} value={stats.spaces} label="Spaces" />
            )}
            {avgRating > 0 && (
              <StatChip icon={Star} value={avgRating.toFixed(1)} label="Rating" gold />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorProfileHeader;
