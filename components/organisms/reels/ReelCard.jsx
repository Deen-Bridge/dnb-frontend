"use client";

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

  const actionStack = (
    <div className="hidden flex-col items-center gap-4 md:flex">
      <ReelActionButton
        icon={
          <Heart
            className={cn(
              "h-6 w-6",
              viewerLiked && "fill-red-500 text-red-500"
            )}
          />
        }
        label={likeCount.toLocaleString()}
        accessibleLabel="Like"
        active={viewerLiked}
        onClick={() => handleReact("like")}
      />
      <ReelActionButton
        icon={
          <ThumbsUp
            className={cn(
              "h-6 w-6",
              viewerLoved && "fill-sky-400 text-sky-400"
            )}
          />
        }
        label={loveCount.toLocaleString()}
        accessibleLabel="Love"
        active={viewerLoved}
        onClick={() => handleReact("love")}
      />
      <ReelActionButton
        icon={<MessageCircle className="h-6 w-6" />}
        label={reel.stats?.comments?.toLocaleString?.() || 0}
        accessibleLabel="Comments"
        onClick={onOpenComments}
      />
      <ReelActionButton
        icon={<Share2 className="h-6 w-6" />}
        label={reel.stats?.shares?.toLocaleString?.() || 0}
        accessibleLabel="Share"
        onClick={onShare}
      />
    </div>
  );

  return (
    <div
      id={`reel-${reel.id}`}
      className="relative flex h-full w-full items-center justify-center"
    >
      <div className="relative flex h-[78vh] w-full max-w-[440px] items-center justify-center md:h-[82vh]">
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-black shadow-2xl">
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

          <button
            type="button"
            className="absolute right-4 top-4 z-30 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur transition hover:bg-black/80"
            onClick={() => setMuted((prev) => !prev)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-5 pb-6 pt-16 text-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={reel.createdBy?.avatar} />
                <AvatarFallback>{viewerAvatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">
                  {reel.createdBy?.name || "Anonymous"}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-white/70">
                  {formattedDate}
                </span>
              </div>
              <button
                type="button"
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/30"
              >
                Follow
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {reel.description}
            </p>
            {reel.tags?.length ? (
              <p className="mt-2 text-xs text-white/70">
                {reel.tags.map((tag) => `#${tag}`).join(" ")}
              </p>
            ) : null}
          </div>

          <div className="absolute bottom-28 right-4 z-20 flex flex-col items-center gap-4 md:hidden">
            <ReelActionButton
              icon={
                <Heart
                  className={cn(
                    "h-6 w-6",
                    viewerLiked && "fill-red-500 text-red-500"
                  )}
                />
              }
              label={likeCount.toLocaleString()}
              accessibleLabel="Like"
              active={viewerLiked}
              onClick={() => handleReact("like")}
            />
            <ReelActionButton
              icon={
                <ThumbsUp
                  className={cn(
                    "h-6 w-6",
                    viewerLoved && "fill-sky-400 text-sky-400"
                  )}
                />
              }
              label={loveCount.toLocaleString()}
              accessibleLabel="Love"
              active={viewerLoved}
              onClick={() => handleReact("love")}
            />
            <ReelActionButton
              icon={<MessageCircle className="h-6 w-6" />}
              label={reel.stats?.comments?.toLocaleString?.() || 0}
              accessibleLabel="Comments"
              onClick={onOpenComments}
            />
            <ReelActionButton
              icon={<Share2 className="h-6 w-6" />}
              label={reel.stats?.shares?.toLocaleString?.() || 0}
              accessibleLabel="Share"
              onClick={onShare}
            />
          </div>
        </div>

        <div className="absolute -right-20 top-1/2 hidden -translate-y-1/2 md:block">
          {actionStack}
        </div>
      </div>

      {hasPrev && (
        <button
          type="button"
          className="absolute left-4 top-1/2 flex -translate-y-1/2 rounded-full bg-black/45 p-2 text-white shadow-lg backdrop-blur transition hover:bg-black/70 md:hidden"
          onClick={onPrev}
          aria-label="Previous reel"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="absolute right-4 top-1/2 flex -translate-y-1/2 rounded-full bg-black/45 p-2 text-white shadow-lg backdrop-blur transition hover:bg-black/70 md:hidden"
          onClick={onNext}
          aria-label="Next reel"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ReelCard;
