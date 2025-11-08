import axiosInstance from "@/lib/config/axios.config";

/**
 * Toggle bookmark for a course
 * @param {string} courseId - Course ID to bookmark/unbookmark
 * @returns {Promise<Object>} - Response with bookmark status
 */
export async function toggleCourseBookmark(courseId) {
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

/**
 * Get all bookmarked courses for the authenticated user
 * @returns {Promise<Object>} - List of bookmarked courses
 */
export async function getBookmarkedCourses() {
  try {
    const response = await axiosInstance.get("/api/courses/bookmarks");
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked courses:", error);
    throw error;
  }
}

/**
 * Check if a course is bookmarked
 * @param {string} courseId - Course ID to check
 * @returns {Promise<boolean>} - Whether the course is bookmarked
 */
export async function checkIfBookmarked(courseId) {
  try {
    const response = await axiosInstance.get(
      `/api/courses/${courseId}/bookmark/check`
    );
    return response.data.isBookmarked;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}

/**
 * Remove a bookmark
 * @param {string} courseId - Course ID to remove bookmark from
 * @returns {Promise<Object>} - Response
 */
export async function removeBookmark(courseId) {
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
