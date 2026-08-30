import { useBookmarkCore, UseBookmarkCoreResult } from "./useBookmarkCore";

export const useBookmark = (
  courseId: string,
  onToggle?: (isBookmarked: boolean) => void,
  initialIsBookmarked: boolean | null = null
): UseBookmarkCoreResult => {
  return useBookmarkCore(courseId, "course", onToggle, initialIsBookmarked);
};

export default useBookmark;
