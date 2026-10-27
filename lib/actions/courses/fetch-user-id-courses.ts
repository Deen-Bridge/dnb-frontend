import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export async function fetchUserCourses(userId: string): Promise<any[]> { // TODO(types): Courses array for user
  try {
    const response = await axiosInstance.get(
      `/api/courses/user?createdBy=${userId}`
    );
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logger.error("Error fetching user courses:", error);
    return [];
  }
}
