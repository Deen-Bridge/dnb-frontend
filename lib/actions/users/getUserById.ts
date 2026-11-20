import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";

export const getUserById = async (userId?: string): Promise<any | null> => { // TODO(types): User API record payload
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}`);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from user endpoint
    logger.error("Error fetching user:", e.message);
    return null;
  }
};
