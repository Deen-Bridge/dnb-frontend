// Fetch all courses from the backend API
import axiosInstance from "@/lib/config/axios.config";

export async function fetchCourses() {
  try {
    const response = await axiosInstance.get("/api/courses");
    console.log("API Response:", response);
    console.log("API Response Data:", response.data);
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}
