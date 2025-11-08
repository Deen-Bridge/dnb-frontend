"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import {
  commentOnReel,
  deleteReelComment,
  fetchReelComments,
} from "@/lib/actions/reels-action";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button as ShadButton } from "@/components/ui/button";

dayjs.extend(relativeTime);

const mapComment = (comment) => ({
  id: comment?._id,
  text: comment?.text,
  createdAt: comment?.createdAt,
  user: comment?.user
    ? {
        id: comment.user._id || comment.user.id,
        name: comment.user.name,
        avatar: comment.user.avatar,
      }
    : null,
});

const ReelCommentsSheet = ({
  reel,
  open,
  onOpenChange,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [deleting, setDeleting] = useState({});
  const mountedRef = useRef(false);

  const allowDelete = (comment) => {
    const viewerId = user?._id;
    if (!viewerId) return false;
    if (comment.user?.id && comment.user.id === viewerId) return true;
    if (reel?.createdBy?.id && reel.createdBy.id === viewerId) return true;
    return false;
  };

  useEffect(() => {
    if (!open) {
      mountedRef.current = false;
      setComments([]);
      setPage(1);
      setHasMore(true);
      return;
    }
    mountedRef.current = true;
    loadComments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reel?.id]);

  const loadComments = async (nextPage, reset = false) => {
    if (!reel?.id) return;
    setLoading(true);
    try {
      const response = await fetchReelComments(reel.id, {
        page: nextPage,
        limit: 20,
      });

      if (!response?.success) {
        setHasMore(false);
        return;
      }

      const mapped =
        response.comments?.map((comment) => mapComment(comment)) || [];

      setComments((prev) =>
        reset ? mapped : [...prev.filter(Boolean), ...mapped]
      );
      setPage(response.page);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;
    if (!reel?.id) return;
    setPosting(true);
    try {
      const response = await commentOnReel(reel.id, newComment.trim());
      if (response?.success && response.comment) {
        const mapped = mapComment(response.comment);
        setComments((prev) => [mapped, ...prev]);
        setNewComment("");
        setPage(1);
        setHasMore(true);
        onCommentAdded?.(mapped, response?.stats);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!commentId || !reel?.id) return;
    setDeleting((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await deleteReelComment(reel.id, commentId);
      if (response?.success) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
        onCommentDeleted?.(commentId, response?.stats);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setDeleting((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    }
  };

  const viewerAvatarFallback = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [user?.name]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 p-0 md:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold text-foreground">
            Comments
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            {comments.length === 0 && !loading ? (
              <div className="flex h-52 flex-col items-center justify-center text-center text-muted-foreground">
                <p className="text-sm">No comments yet.</p>
                <p className="text-xs">
                  Be the first to share your reflections on this reel.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3 rounded-xl bg-muted/60 p-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={comment.user?.avatar} />
                      <AvatarFallback>
                        {comment.user?.name
                          ?.split(" ")
                          ?.map((part) => part.charAt(0).toUpperCase())
                          ?.slice(0, 2)
                          ?.join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {comment.user?.name || "Unknown User"}
                          </p>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {comment.createdAt
                              ? dayjs(comment.createdAt).fromNow()
                              : "Just now"}
                          </p>
                        </div>
                        {allowDelete(comment) && (
                          <ShadButton
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-rose-50 hover:text-rose-500"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deleting[comment.id]}
                          >
                            {deleting[comment.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </ShadButton>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="flex justify-center">
                    <ShadButton
                      variant="outline"
                      className="border-accent/40 text-accent hover:bg-accent/10"
                      onClick={() => loadComments(page + 1)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load more"
                      )}
                    </ShadButton>
                  </div>
                )}
              </div>
            )}

            {loading && comments.length > 0 && (
              <div className="flex justify-center pb-6">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            )}
          </ScrollArea>
        </div>

        <SheetFooter className="border-t border-border px-6 py-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="mt-1 h-9 w-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{viewerAvatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-3">
              <Textarea
                placeholder="Share your reflections..."
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                className="min-h-[90px] resize-none bg-muted/60"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{500 - newComment.length} characters remaining</span>
                <ShadButton
                  className="bg-accent text-white hover:bg-highlight"
                  onClick={handlePost}
                  disabled={posting || !newComment.trim()}
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post Comment"
                  )}
                </ShadButton>
              </div>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ReelCommentsSheet;
