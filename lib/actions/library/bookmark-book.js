import axiosInstance from "@/lib/config/axios.config";

export const toggleBookBookmark = async (bookId) => {
  try {
    const response = await axiosInstance.post(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling book bookmark:", error);
    throw error.response?.data || error;
  }
};

export const getBookmarkedBooks = async () => {
  try {
    const response = await axiosInstance.get("/api/books/bookmarks");
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked books:", error);
    throw error.response?.data || error;
  }
};

export const checkIfBookBookmarked = async (bookId) => {
  try {
    const response = await axiosInstance.get(
      `/api/books/${bookId}/bookmark/check`
    );
    return response.data.isBookmarked;
  } catch (error) {
    console.error("Error checking book bookmark status:", error);
    throw error.response?.data || error;
  }
};

export const removeBookBookmark = async (bookId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing book bookmark:", error);
    throw error.response?.data || error;
  }
};

