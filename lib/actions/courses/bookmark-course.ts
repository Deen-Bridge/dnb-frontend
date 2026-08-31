import axiosInstance from "@/lib/config/axios.config";

export async function toggleCourseBookmark(courseId: string): Promise<any> { // TODO(types): Response from bookmark toggle
  try {
    const response = await axiosInstance.post(
      `/api/courses/${courseId}/bookmark`
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
}

export async function getBookmarkedCourses(): Promise<any> { // TODO(types): Response from get bookmarks
  try {
    const response = await axiosInstance.get("/api/courses/bookmarks");
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked courses:", error);
    throw error;
  }
}

export async function checkIfBookmarked(courseId: string): Promise<boolean> {
  try {
    const response = await axiosInstance.get(
      `/api/courses/${courseId}/bookmark/check`
    );
    return Boolean(response.data?.isBookmarked);
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}

export async function removeBookmark(courseId: string): Promise<any> { // TODO(types): Response from remove bookmark
  try {
    const response = await axiosInstance.delete(
      `/api/courses/${courseId}/bookmark`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw error;
  }
}
