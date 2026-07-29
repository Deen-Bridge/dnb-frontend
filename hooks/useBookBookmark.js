import { useBookmarkCore } from "./useBookmarkCore";

/**
 * Custom hook for managing book bookmarks
 * @param {string} bookId - The book ID
 * @param {function} [onToggle] - Optional callback when bookmark is toggled
 * @param {boolean|null} [initialIsBookmarked=null] - Optional pre-seeded bookmark state
 * @returns {Object} - Bookmark state and toggle function
 */
export const useBookBookmark = (bookId, onToggle, initialIsBookmarked = null) => {
  return useBookmarkCore(bookId, "book", onToggle, initialIsBookmarked);
};

export default useBookBookmark;
