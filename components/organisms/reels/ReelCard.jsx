"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
  Play,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReelActionButton from "@/components/atoms/reels/ReelActionButton";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ReelCard = ({
  reel,
  onReact,
  onOpenComments,
  onShare,
  onView,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  playing,
  setPlaying,
}) => {
  const videoRef = useRef(null);
  const [viewerLiked, setViewerLiked] = useState(reel.viewerState?.liked);
  const [viewerLoved, setViewerLoved] = useState(reel.viewerState?.loved);
  const [likeCount, setLikeCount] = useState(reel.stats?.likes || 0);
  const [loveCount, setLoveCount] = useState(reel.stats?.loves || 0);
  const [muted, setMuted] = useState(true);

  const isPaused = playing !== reel.id;

  useEffect(() => {
    setViewerLiked(reel.viewerState?.liked);
    setViewerLoved(reel.viewerState?.loved);
    setLikeCount(reel.stats?.likes || 0);
    setLoveCount(reel.stats?.loves || 0);
    setMuted(true);
  }, [
    reel.id,
    reel.viewerState?.liked,
    reel.viewerState?.loved,
    reel.stats?.likes,
    reel.stats?.loves,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing === reel.id) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, reel.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.volume = muted ? 0 : 1;
  }, [muted]);

  useEffect(() => {
    if (playing === reel.id) {
      onView?.();
    }
  }, [playing, reel.id, onView]);

  const handleReact = async (type) => {
    const optimistic = type === "like" ? !viewerLiked : !viewerLoved;
    const previousLiked = viewerLiked;
    const previousLoved = viewerLoved;
    const previousLikeCount = likeCount;
    const previousLoveCount = loveCount;

    if (type === "like") {
      setViewerLiked((prev) => !prev);
      setLikeCount((prev) => prev + (optimistic ? 1 : -1));
      if (viewerLoved) {
        setViewerLoved(false);
        setLoveCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      setViewerLoved((prev) => !prev);
      setLoveCount((prev) => prev + (optimistic ? 1 : -1));
      if (viewerLiked) {
        setViewerLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }
    }

    try {
      const response = await onReact?.(type);
      if (response?.reactions) {
        setLikeCount(response.reactions.likes);
        setLoveCount(response.reactions.loves);
        if (response.viewerState) {
          setViewerLiked(response.viewerState.liked);
          setViewerLoved(response.viewerState.loved);
        }
      }
    } catch (error) {
      setViewerLiked(previousLiked);
      setViewerLoved(previousLoved);
      setLikeCount(previousLikeCount);
      setLoveCount(previousLoveCount);
    }
  };

  const viewerAvatarFallback = useMemo(() => {
    if (!reel?.createdBy?.name) return "U";
    return reel.createdBy.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [reel?.createdBy?.name]);

  const formattedDate = reel.createdAt
    ? dayjs(reel.createdAt).fromNow()
    : "Just now";

  return (
    <div
      id={`reel-${reel.id}`}
      className="relative flex h-full w-full items-center justify-center bg-black"
    >
      {/* Full-bleed 9:16 video column (letterboxed on wide screens) */}
      <div className="relative h-full w-full overflow-hidden bg-black sm:max-w-[460px]">
        <video
          ref={videoRef}
          src={reel.video}
          className="h-full w-full object-cover"
          playsInline
          loop
          preload="metadata"
          controls={false}
          onClick={() => setPlaying(playing === reel.id ? null : reel.id)}
        />

        {/* Paused overlay */}
        {isPaused && (
          <button
            type="button"
            onClick={() => setPlaying(reel.id)}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/10"
            aria-label="Play"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur">
              <Play className="h-7 w-7 fill-white text-white" />
            </span>
          </button>
        )}

        {/* Mute toggle */}
        <button
          type="button"
          className="absolute right-3 top-3 z-30 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
          onClick={() => setMuted((prev) => !prev)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        {/* Right action rail — overlaid inside, all breakpoints (TikTok-style) */}
        <div className="absolute bottom-24 right-2.5 z-30 flex flex-col items-center gap-5">
          <div className="mb-1 flex flex-col items-center">
            <Avatar className="h-11 w-11 border-2 border-white">
              <AvatarImage src={reel.createdBy?.avatar} />
              <AvatarFallback className="bg-accent text-sm text-white">
                {viewerAvatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>
          <ReelActionButton
            icon={
              <Heart
                className={cn(
                  "h-7 w-7",
                  viewerLiked && "fill-red-500 text-red-500"
                )}
              />
            }
            label={likeCount.toLocaleString()}
            accessibleLabel={`Like, ${likeCount.toLocaleString()}`}
            active={viewerLiked}
            pressed={viewerLiked}
            onClick={() => handleReact("like")}
          />
          <ReelActionButton
            icon={
              <ThumbsUp
                className={cn(
                  "h-7 w-7",
                  viewerLoved && "fill-sky-400 text-sky-400"
                )}
              />
            }
            label={loveCount.toLocaleString()}
            accessibleLabel={`Love, ${loveCount.toLocaleString()}`}
            active={viewerLoved}
            pressed={viewerLoved}
            onClick={() => handleReact("love")}
          />
          <ReelActionButton
            icon={<MessageCircle className="h-7 w-7" />}
            label={reel.stats?.comments?.toLocaleString?.() || 0}
            accessibleLabel={`Comments, ${reel.stats?.comments?.toLocaleString?.() || 0}`}
            onClick={onOpenComments}
          />
          <ReelActionButton
            icon={<Share2 className="h-7 w-7" />}
            label={reel.stats?.shares?.toLocaleString?.() || 0}
            accessibleLabel={`Share, ${reel.stats?.shares?.toLocaleString?.() || 0}`}
            onClick={onShare}
          />
        </div>

        {/* Caption overlay (bottom-left) */}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pb-6 pr-16 pt-16 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">
              @{reel.createdBy?.name || "Anonymous"}
            </span>
            <span className="text-[11px] text-white/60">·</span>
            <span className="text-[11px] text-white/70">{formattedDate}</span>
            <button
              type="button"
              className="ml-1 rounded-full border border-white/40 px-3 py-0.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              Follow
            </button>
          </div>
          {reel.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/90">
              {reel.description}
            </p>
          )}
          {reel.tags?.length ? (
            <p className="mt-1.5 text-xs font-medium text-white/80">
              {reel.tags.map((tag) => `#${tag}`).join(" ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Up / down navigation (right edge, all breakpoints) */}
      <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-4">
        {hasPrev && (
          <button
            type="button"
            className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
            onClick={onPrev}
            aria-label="Previous reel"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
            onClick={onNext}
            aria-label="Next reel"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReelCard;
