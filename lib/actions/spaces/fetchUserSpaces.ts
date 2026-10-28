import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export async function fetchUserSpaces(userId: string): Promise<any[]> {
  // TODO(types): Spaces list by host
  try {
    const response = await axiosInstance.get(`/api/spaces/by-host/${userId}`);

    return Array.isArray(response.data) ? response.data : response.data?.spaces || [];
  } catch (error) {
    logger.error("Error fetching user spaces:", error);
    return [];
  }
}
