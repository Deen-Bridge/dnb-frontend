import axiosInstance from "@/lib/config/axios.config";

export async function fetchRecomBooks(interests: any): Promise<any[]> { // TODO(types): Interests filter params
  try {
    console.log("Fetching courses for user ID:", interests);
    const response = await axiosInstance.get("/api/books/recom", { params: interests });
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.log("Error fetching user courses:", error);
    return [];
  }
}
