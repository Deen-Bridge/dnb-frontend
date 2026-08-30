import axiosInstance from "@/lib/config/axios.config";

export async function fetchCourses(): Promise<any[]> { // TODO(types): Courses array returned from API
  try {
    const response = await axiosInstance.get("/api/courses");
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.log("Error fetching courses:", error);
    return [];
  }
}
