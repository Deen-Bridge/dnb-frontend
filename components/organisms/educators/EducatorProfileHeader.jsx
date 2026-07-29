"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import {
  Copy,
  Share2,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

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
      <div className="bg-accent h-40 sm:h-48 w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-12 sm:-mt-14">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg">
            <AvatarImage src={educator?.avatar} alt={educator?.name} />
            <AvatarFallback className="text-2xl">
              {educator?.name?.charAt(0) || "E"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-4 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {educator?.name}
              </h1>
              {educator?.role && (
                <p className="text-muted-foreground text-sm">{educator.role}</p>
              )}
              {educator?.bio && (
                <p className="text-foreground/80 max-w-2xl mt-2">
                  {educator.bio}
                </p>
              )}
              {educator?.createdAt && (
                <p className="text-muted-foreground text-xs flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3" />
                  Joined{" "}
                  {format(new Date(educator.createdAt), "MMMM yyyy")}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                round
                outlined
                className="text-sm px-3 gap-1.5"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {isOwnProfile ? (
                <Button
                  to="/profile-setup"
                  round
                  outlined
                  className="text-sm px-4"
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  round
                  loading={followLoading}
                  className={cn(
                    "text-sm px-5",
                    isFollowing && "bg-accent text-white hover:bg-accent/90"
                  )}
                  onClick={onFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-accent" />
              <span className="font-semibold">{followersCount}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
            {stats && stats.courses > 0 && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-accent" />
                <span className="font-semibold">{stats.courses}</span>
                <span className="text-muted-foreground">Courses</span>
              </div>
            )}
            {stats && stats.books > 0 && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="font-semibold">{stats.books}</span>
                <span className="text-muted-foreground">Books</span>
              </div>
            )}
            {stats && stats.spaces > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-semibold">{stats.spaces}</span>
                <span className="text-muted-foreground">Spaces</span>
              </div>
            )}
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">Rating</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorProfileHeader;
