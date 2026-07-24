import { useBookmarkCore } from "./useBookmarkCore";

/**
 * Custom hook for managing course bookmarks
 * @param {string} courseId - The course ID
 * @param {function} [onToggle] - Optional callback when bookmark is toggled
 * @param {boolean|null} [initialIsBookmarked=null] - Optional pre-seeded bookmark state
 * @returns {Object} - Bookmark state and toggle function
 */
export const useBookmark = (courseId, onToggle, initialIsBookmarked = null) => {
  return useBookmarkCore(courseId, "course", onToggle, initialIsBookmarked);
};

export default useBookmark;
