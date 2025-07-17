// Fetch all courses from the backend API
import axiosInstance from "@/lib/config/axios.config";

export async function searchQuery(query) {
  try {
    const response = await axiosInstance.get(`/api/search?q=${query}`);
    console.log("API Response:", response);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error searching:", error);
    return [];
  }
}
