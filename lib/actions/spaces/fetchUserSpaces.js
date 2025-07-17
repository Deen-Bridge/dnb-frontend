import axiosInstance from "@/lib/config/axios.config";

// Fetch spaces created by a specific user by userId
export async function fetchUserSpaces(userId) {
  try {
    console.log("Fetching spaces for user ID:", userId);
    const response = await axiosInstance.get(
      `/api/spaces/by-host/${userId}`
    );

    return response.data;
  } catch (error) {
    console.log("Error fetching user spaces:", error);
    return [];
  }
}
