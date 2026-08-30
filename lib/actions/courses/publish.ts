import axiosInstance from "@/lib/config/axios.config";

export interface BulkPublishError {
  id: string;
  message: string;
}

export interface BulkPublishResult {
  success: string[];
  errors: BulkPublishError[];
}

/**
 * Sequential bulk publish handler for courses.
 */
export async function bulkPublishCourses(courseIds: string[]): Promise<BulkPublishResult> {
  const results: BulkPublishResult = { success: [], errors: [] };
  for (const id of courseIds) {
    try {
      await axiosInstance.post(`/api/courses/${id}/publish`);
      results.success.push(id);
    } catch (e: any) { // TODO(types): Error from course publish request
      results.errors.push({ id, message: e?.message || "Publish failed" });
    }
  }
  return results;
}
