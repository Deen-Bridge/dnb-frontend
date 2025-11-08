import { useEffect, useState } from "react";
import {
  toggleBookBookmark,
  checkIfBookBookmarked,
} from "@/lib/actions/library/bookmark-book";
import { toast } from "sonner";
import useAuth from "./useAuth";

export const useBookBookmark = (bookId, onToggle) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (user?._id && bookId) {
        try {
          const bookmarked = await checkIfBookBookmarked(bookId);
          setIsBookmarked(Boolean(bookmarked));
        } catch (_error) {
          // ignore
        }
      }
    };

    checkBookmark();
  }, [user?._id, bookId]);

  const toggle = async () => {
    if (!user) {
      toast.error("Please login to bookmark books");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleBookBookmark(bookId);
      setIsBookmarked(result.isBookmarked);
      toast.success(result.message);
      if (onToggle) {
        onToggle(result.isBookmarked);
      }
    } catch (_error) {
      toast.error("Failed to update book bookmark");
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

export default useBookBookmark;

