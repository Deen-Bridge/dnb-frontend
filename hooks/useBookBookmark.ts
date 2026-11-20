import { useBookmarkCore, UseBookmarkCoreResult } from "./useBookmarkCore";

export const useBookBookmark = (
  bookId: string,
  onToggle?: (isBookmarked: boolean) => void,
  initialIsBookmarked: boolean | null = null
): UseBookmarkCoreResult => {
  return useBookmarkCore(bookId, "book", onToggle, initialIsBookmarked);
};

export default useBookBookmark;
