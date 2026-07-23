import { useState, useEffect } from "react";
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

/**
 * Core custom hook for managing bookmarks (courses & books)
 * @param {string} itemId - Item ID (course or book ID)
 * @param {'course'|'book'} type - Type of item
 * @param {function} [onToggle] - Optional callback when bookmark is toggled
 * @param {boolean|null} [initialIsBookmarked=null] - Pre-seeded bookmark state to avoid mount check API call
 * @returns {Object} - { isBookmarked, loading, toggle }
 */
export const useBookmarkCore = (
  itemId,
  type = "course",
  onToggle,
  initialIsBookmarked = null
) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return typeof initialIsBookmarked === "boolean" ? initialIsBookmarked : false;
  });
  const [loading, setLoading] = useState(false);

  // Sync initialIsBookmarked if it changes dynamically
  useEffect(() => {
    if (typeof initialIsBookmarked === "boolean") {
      setIsBookmarked(initialIsBookmarked);
    }
  }, [initialIsBookmarked]);

  // Check bookmark status on mount only if initialIsBookmarked was not provided
  useEffect(() => {
    const checkBookmark = async () => {
      if (typeof initialIsBookmarked === "boolean") {
        return; // Skip network request when pre-seeded
      }

      if (user?._id && itemId) {
        try {
          if (type === "course") {
            const bookmarked = await checkIfBookmarked(itemId);
            setIsBookmarked(Boolean(bookmarked));
          } else if (type === "book") {
            const bookmarked = await checkIfBookBookmarked(itemId);
            setIsBookmarked(Boolean(bookmarked));
          }
        } catch (_error) {
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

    const previousState = isBookmarked;
    const nextState = !previousState;

    // Optimistic update
    setIsBookmarked(nextState);
    if (onToggle) {
      onToggle(nextState);
    }

    setLoading(true);

    try {
      let result;
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
    } catch (error) {
      // Revert optimistic update on failure
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
