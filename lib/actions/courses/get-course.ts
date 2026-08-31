import axiosInstance from "@/lib/config/axios.config";

export async function getCourseById(courseId: string): Promise<any | null> { // TODO(types): Course API record
  try {
    const response = await axiosInstance.get(`/api/courses/${courseId}`);
    if (response.data && response.data.course) {
      return response.data.course;
    }
    return response.data ?? null;
  } catch (error) {
    console.log("Error fetching course:", error);
    return null;
  }
}
