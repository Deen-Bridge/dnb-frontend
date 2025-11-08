import { useState, useEffect } from "react";
import {
  toggleCourseBookmark,
  checkIfBookmarked,
} from "@/lib/actions/courses/bookmark-course";
import { toast } from "sonner";
import useAuth from "./useAuth";

/**
 * Custom hook for managing course bookmarks
 * @param {string} courseId - The course ID
 * @param {function} onToggle - Optional callback when bookmark is toggled
 * @returns {Object} - Bookmark state and toggle function
 */
export const useBookmark = (courseId, onToggle) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if course is bookmarked on mount
  useEffect(() => {
    const checkBookmark = async () => {
      if (user?._id && courseId) {
        try {
          const bookmarked = await checkIfBookmarked(courseId);
          setIsBookmarked(bookmarked);
        } catch (error) {
          // Silently fail - not critical
        }
      }
    };
    checkBookmark();
  }, [user?._id, courseId]);

  const toggle = async () => {
    if (!user) {
      toast.error("Please login to bookmark courses");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleCourseBookmark(courseId);
      setIsBookmarked(result.isBookmarked);
      toast.success(result.message);

      // Call optional callback
      if (onToggle) {
        onToggle(result.isBookmarked);
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
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

export default useBookmark;
