import axiosInstance from "@/lib/config/axios.config";

export const toggleBookBookmark = async (bookId: string): Promise<any> => { // TODO(types): Book bookmark toggle result
  try {
    const response = await axiosInstance.post(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error: any) { // TODO(types): Axios error on toggle bookmark
    console.error("Error toggling book bookmark:", error);
    throw error.response?.data || error;
  }
};

export const getBookmarkedBooks = async (): Promise<any> => { // TODO(types): Bookmarked books response
  try {
    const response = await axiosInstance.get("/api/books/bookmarks");
    return response.data;
  } catch (error: any) { // TODO(types): Axios error on get book bookmarks
    console.error("Error fetching bookmarked books:", error);
    throw error.response?.data || error;
  }
};

export const checkIfBookBookmarked = async (bookId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/books/${bookId}/bookmark/check`
    );
    return Boolean(response.data?.isBookmarked);
  } catch (error: any) { // TODO(types): Axios error on check book bookmark
    console.error("Error checking book bookmark status:", error);
    throw error.response?.data || error;
  }
};

export const removeBookBookmark = async (bookId: string): Promise<any> => { // TODO(types): Remove book bookmark result
  try {
    const response = await axiosInstance.delete(
      `/api/books/${bookId}/bookmark`
    );
    return response.data;
  } catch (error: any) { // TODO(types): Axios error on remove book bookmark
    console.error("Error removing book bookmark:", error);
    throw error.response?.data || error;
  }
};
