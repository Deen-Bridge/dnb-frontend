import axiosInstance from "@/lib/config/axios.config";

/**
 * Sequential bulk publish handler for courses.
 */
export async function bulkPublishCourses(courseIds) {
  const results = { success: [], errors: [] };
  for (const id of courseIds) {
    try {
      await axiosInstance.post(`/api/courses/${id}/publish`);
      results.success.push(id);
    } catch (e) {
      results.errors.push({ id, message: e.message });
    }
  }
  return results;
}