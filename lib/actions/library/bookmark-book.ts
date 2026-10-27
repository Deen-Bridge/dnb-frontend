import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";
import type { Book } from "@/types/api";

/** Response of POST/DELETE /api/books/:id/bookmark. */
export interface BookmarkMutationResponse {
  isBookmarked?: boolean;
  message?: string;
}

/** Response of GET /api/books/bookmarks. */
export interface BookmarkedBooksResponse {
  bookmarks?: Book[];
}

/** Minimal shape of an axios error, used to unwrap the server payload. */
type AxiosErrorLike = { response?: { data?: unknown } };

function toRethrowable(error: unknown): unknown {
  return (error as AxiosErrorLike).response?.data || error;
}

export const toggleBookBookmark = async (bookId: string): Promise<BookmarkMutationResponse> => {
  try {
    const response = await axiosInstance.post(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error: unknown) {
    logger.error("Error toggling book bookmark:", error);
    throw toRethrowable(error);
  }
};

export const getBookmarkedBooks = async (): Promise<BookmarkedBooksResponse> => {
  try {
    const response = await axiosInstance.get("/api/books/bookmarks");
    return response.data;
  } catch (error: unknown) {
    logger.error("Error fetching bookmarked books:", error);
    throw toRethrowable(error);
  }
};

export const checkIfBookBookmarked = async (bookId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/books/${bookId}/bookmark/check`
    );
    return Boolean(response.data?.isBookmarked);
  } catch (error: unknown) {
    logger.error("Error checking book bookmark status:", error);
    throw toRethrowable(error);
  }
};

export const removeBookBookmark = async (bookId: string): Promise<BookmarkMutationResponse> => {
  try {
    const response = await axiosInstance.delete(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error: unknown) {
    logger.error("Error removing book bookmark:", error);
    throw toRethrowable(error);
  }
};
