import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";

export const getUserById = async (userId) => {
  if (!userId) {
    console.error("getUserById: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}`, config);
    return res.data;
  } catch (e) {
    console.error("Error fetching user:", e.message);
    return null;
  }
};
