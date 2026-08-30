import { useState, useEffect, useRef } from "react";
import {
  toggleCourseBookmark,
  checkIfBookmarked,
} from "@/lib/actions/courses/bookmark-course";
import {
  toggleBookBookmark,
  checkIfBookBookmarked,
} from "@/lib/actions/library/bookmark-book";
import { toast } from "sonner";
import useAuth from "./useAuth";

export type BookmarkItemType = "course" | "book";

export interface UseBookmarkCoreResult {
  isBookmarked: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
}

export const useBookmarkCore = (
  itemId: string,
  type: BookmarkItemType = "course",
  onToggle?: (isBookmarked: boolean) => void,
  initialIsBookmarked: boolean | null = null
): UseBookmarkCoreResult => {
  const { user } = useAuth();
  const hasToggledRef = useRef<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    return typeof initialIsBookmarked === "boolean" ? initialIsBookmarked : false;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof initialIsBookmarked === "boolean") {
      setIsBookmarked(initialIsBookmarked);
    }
  }, [initialIsBookmarked]);

  useEffect(() => {
    const checkBookmark = async () => {
      if (typeof initialIsBookmarked === "boolean") {
        return;
      }

      if (user?._id && itemId) {
        try {
          if (type === "course") {
            const bookmarked = await checkIfBookmarked(itemId);
            if (!hasToggledRef.current) {
              setIsBookmarked(Boolean(bookmarked));
            }
          } else if (type === "book") {
            const bookmarked = await checkIfBookBookmarked(itemId);
            if (!hasToggledRef.current) {
              setIsBookmarked(Boolean(bookmarked));
            }
          }
        } catch {
          // Silently handle error for check request
        }
      }
    };

    checkBookmark();
  }, [user?._id, itemId, type, initialIsBookmarked]);

  const toggle = async () => {
    if (!user) {
      toast.error(`Please login to bookmark ${type === "book" ? "books" : "courses"}`);
      return;
    }

    hasToggledRef.current = true;
    const previousState = isBookmarked;
    const nextState = !previousState;

    setIsBookmarked(nextState);
    if (onToggle) {
      onToggle(nextState);
    }

    setLoading(true);

    try {
      let result: any; // TODO(types): Bookmark action response
      if (type === "course") {
        result = await toggleCourseBookmark(itemId);
      } else {
        result = await toggleBookBookmark(itemId);
      }

      if (result && typeof result.isBookmarked === "boolean") {
        setIsBookmarked(result.isBookmarked);
      }
      if (result?.message) {
        toast.success(result.message);
      }
    } catch (error: any) { // TODO(types): Error shape from bookmark toggle
      setIsBookmarked(previousState);
      if (onToggle) {
        onToggle(previousState);
      }
      const errorMessage =
        error?.message ||
        error?.error ||
        `Failed to update ${type === "book" ? "book bookmark" : "bookmark"}`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    isBookmarked,
    loading,
    toggle,
  };
};

export default useBookmarkCore;
