import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export async function fetchRecomCourses(interests: any): Promise<any[]> {
  // TODO(types): Interests filter params
  try {
    const response = await axiosInstance.get("/api/courses/recom", { params: interests });
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logger.error("Error fetching recommended courses:", error);
    return [];
  }
}
