import axiosInstance from "@/lib/config/axios.config";

// Fetch courses created  for  user by interests
export async function fetchRecomCourses(interests) {
  try {
    console.log("Fetching courses for user ID:", interests);
    const response = await axiosInstance.get("/api/courses/recom", interests);
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return response.data;
  } catch (error) {
    console.log("Error fetching user courses:", error);
    return [];
  }
}
