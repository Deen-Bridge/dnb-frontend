import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export async function fetchRecomBooks(interests: any): Promise<any[]> { // TODO(types): Interests filter params
  try {
    const response = await axiosInstance.get("/api/books/recom", { params: interests });
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logger.error("Error fetching user courses:", error);
    return [];
  }
}
