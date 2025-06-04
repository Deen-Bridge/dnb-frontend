// Fetch a single course by ID from the backend API
import axiosInstance from "@/lib/config/axios.config";

export async function getCourseById(courseId) {
  try {
    const response = await axiosInstance.get(`/api/courses/${courseId}`);
    if (response.data && response.data.course) {
      return response.data.course;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}
