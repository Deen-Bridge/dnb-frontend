"use client";


import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/atoms/form/Button";
import ReelCard from "./ReelCard";
import ReelUploadDialog from "./ReelUploadDialog";
import ReelCommentsSheet from "./ReelCommentsSheet";
import ReelShareDialog from "./ReelShareDialog";
import {
  fetchReels,
  reactToReel,
  recordReelView,
  shareReel,
} from "@/lib/actions/reels-action";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { UploadCloud } from "lucide-react";

const LOAD_AHEAD_THRESHOLD = 2;

const ReelFeedInner = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const viewedReelsRef = useRef(new Set());
  const wheelLockRef = useRef(false);
  const initialLoadRef = useRef(false);
  const focusHandledRef = useRef(false);

  const currentReel = reels[currentIndex] || null;

  const loadReels = useCallback(
    async (targetPage = 1, append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await fetchReels({ page: targetPage, limit: 5 });
        if (response?.success) {
          const incoming = response.reels || [];
          setReels((prev) => {
            if (!append) return incoming;
            const existing = new Set(prev.map((item) => item.id));
            const deduped = incoming.filter((item) => !existing.has(item.id));
            return [...prev, ...deduped];
          });
          setPage(response.page || targetPage);
          setHasMore(Boolean(response.hasMore));
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to load reels:", error);
        toast.error("Unable to fetch reels right now.");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    if (initialLoadRef.current) return;
    loadReels(1, false);
    initialLoadRef.current = true;
  }, [loadReels]);

  const handleReact = useCallback(async (reelId, type) => {
    const response = await reactToReel(reelId, type);
    if (response?.success && response.reactions) {
      setReels((prev) =>
        prev.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                stats: {
                  ...reel.stats,
                  likes: response.reactions.likes,
                  loves: response.reactions.loves,
                },
                viewerState: response.viewerState || reel.viewerState,
              }
            : reel
        )
      );
    }
    return response;
  }, []);

  const handleCommentsUpdated = useCallback((reelId, stats) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              stats: {
                ...reel.stats,
                comments: stats?.comments ?? reel.stats?.comments,
              },
            }
          : reel
      )
    );
  }, []);

  const handleShareMenu = useCallback((reel) => {
    setShareTarget(reel);
  }, []);

  const handleShareComplete = useCallback(async (reelId) => {
    try {
      const response = await shareReel(reelId);
      if (response?.success) {
        setReels((prev) =>
          prev.map((item) =>
            item.id === reelId
              ? {
                  ...item,
                  stats: { ...item.stats, shares: response.shareCount },
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to register share:", error);
    }
  }, []);

  const handleView = useCallback(async (reelId) => {
    if (viewedReelsRef.current.has(reelId)) return;
    viewedReelsRef.current.add(reelId);
    try {
      const response = await recordReelView(reelId);
      if (response?.success) {
        setReels((prev) =>
          prev.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  stats: { ...reel.stats, views: response.viewCount },
                }
              : reel
          )
        );
      }
    } catch (error) {
      console.error("Failed to record view:", error);
    }
  }, []);

  const handleUploadSuccess = useCallback((newReel) => {
    if (!newReel) return;
    setReels((prev) => [newReel, ...prev]);
    setCurrentIndex(0);
    setPlayingId(newReel.id);
  }, []);

  const handleFocusFromQuery = useCallback(() => {
    if (
      focusHandledRef.current ||
      typeof window === "undefined" ||
      !reels.length
    )
      return;
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (!focus) return;
    const index = reels.findIndex((reel) => reel.id === focus);
    if (index >= 0) {
      setCurrentIndex(index);
      setPlayingId(focus);
      setTimeout(() => {
        const target = document.getElementById(`reel-${focus}`);
        target?.scrollIntoView({ block: "center", inline: "center" });
      }, 50);
    }
    focusHandledRef.current = true;
    params.delete("focus");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [reels]);

  useEffect(() => {
    handleFocusFromQuery();
  }, [handleFocusFromQuery]);

  useEffect(() => {
    if (!reels.length) return;
    setPlayingId(reels[currentIndex]?.id || null);
    if (reels[currentIndex]?.id) {
      handleView(reels[currentIndex].id);
    }
    if (
      hasMore &&
      reels.length - currentIndex <= LOAD_AHEAD_THRESHOLD &&
      !loading
    ) {
      loadReels(page + 1, true);
    }
  }, [currentIndex, reels, hasMore, loading, loadReels, page, handleView]);

  useEffect(() => {
    const handleWheel = (event) => {
      if (!reels.length) return;
      if (wheelLockRef.current) return;
      if (Math.abs(event.deltaY) < 25) return;
      event.preventDefault();

      wheelLockRef.current = true;
      setCurrentIndex((prev) =>
        event.deltaY > 0
          ? Math.min(prev + 1, Math.max(reels.length - 1, 0))
          : Math.max(prev - 1, 0)
      );

      setTimeout(() => {
        wheelLockRef.current = false;
      }, 280);
    };

    const handleKey = (event) => {
      if (!reels.length) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((prev) =>
          Math.min(prev + 1, Math.max(reels.length - 1, 0))
        );
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
    };
  }, [reels.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, Math.max(reels.length - 1, 0))
    );
  }, [reels.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const feedEmpty = !loading && reels.length === 0;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-black">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3.5 backdrop-blur md:px-8">
        <div>
          <h1 className="text-lg font-semibold text-white md:text-xl">
            Community Reels
          </h1>
          <p className="text-xs text-white/60">
            Short reflections from the community.
          </p>
        </div>
        <Button
          round
          className="flex items-center gap-2 bg-accent text-white hover:bg-highlight"
          onClick={() => setUploadOpen(true)}
        >
          <UploadCloud className="h-4 w-4" />
          Share Reel
        </Button>
      </div>

      {feedEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="rounded-full bg-accent/20 p-4 text-white shadow-inner">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              The feed is quiet… for now.
            </h2>
            <p className="text-sm text-white/60">
              Be the first to post a reel and spark a wave of inspiration.
            </p>
          </div>
          <Button
            round
            className="bg-accent text-white hover:bg-highlight"
            onClick={() => setUploadOpen(true)}
          >
            Upload a Reel
          </Button>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          {currentReel ? (
            <ReelCard
              reel={currentReel}
              playing={playingId}
              setPlaying={setPlayingId}
              onReact={(type) => handleReact(currentReel.id, type)}
              onOpenComments={() => setCommentTarget(currentReel)}
              onShare={() => handleShareMenu(currentReel)}
              onView={() => handleView(currentReel.id)}
              onNext={handleNext}
              onPrev={handlePrevious}
              hasNext={currentIndex < reels.length - 1}
              hasPrev={currentIndex > 0}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/70">
              <UploadCloud className="h-10 w-10 animate-pulse" />
              <p className="text-sm">Preparing your feed…</p>
            </div>
          )}
        </div>
      )}

      <ReelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleUploadSuccess}
      />

      <ReelCommentsSheet
        reel={commentTarget}
        open={Boolean(commentTarget)}
        onOpenChange={(openState) => {
          if (!openState) {
            setCommentTarget(null);
          }
        }}
        onCommentAdded={(comment, stats) => {
          if (!commentTarget) return;
          handleCommentsUpdated(commentTarget.id, stats);
        }}
        onCommentDeleted={(commentId, stats) => {
          if (!commentTarget) return;
          handleCommentsUpdated(commentTarget.id, stats);
        }}
      />

      <ReelShareDialog
        reel={shareTarget}
        open={Boolean(shareTarget)}
        onOpenChange={(open) => {
          if (!open) setShareTarget(null);
        }}
        onShared={handleShareComplete}
      />
    </div>
  );
};

const ReelFeed = () => {
  return <ReelFeedInner />;
};

export default ReelFeed;
