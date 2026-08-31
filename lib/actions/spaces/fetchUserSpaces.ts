import axiosInstance from "@/lib/config/axios.config";

export async function fetchUserSpaces(userId: string): Promise<any[]> { // TODO(types): Spaces list by host
  try {
    console.log("Fetching spaces for user ID:", userId);
    const response = await axiosInstance.get(
      `/api/spaces/by-host/${userId}`
    );

    return Array.isArray(response.data) ? response.data : response.data?.spaces || [];
  } catch (error) {
    console.log("Error fetching user spaces:", error);
    return [];
  }
}
