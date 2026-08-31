import axiosInstance from "@/lib/config/axios.config";

export async function fetchUserCourses(userId: string): Promise<any[]> { // TODO(types): Courses array for user
  try {
    console.log("Fetching courses for user ID:", userId);
    const response = await axiosInstance.get(
      `/api/courses/user?createdBy=${userId}`
    );
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.log("Error fetching user courses:", error);
    return [];
  }
}
