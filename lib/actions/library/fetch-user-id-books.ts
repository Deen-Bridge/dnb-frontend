import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export async function fetchUserBooks(userId: string): Promise<any[]> {
  // TODO(types): Books array by user ID
  try {
    const response = await axiosInstance.get(`/api/books/by-author/${userId}`);
    if (response.data && response.data.books) {
      return response.data.books;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logger.error("Error fetching user books:", error);
    return [];
  }
}
