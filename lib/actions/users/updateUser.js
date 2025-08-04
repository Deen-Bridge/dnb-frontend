import axiosInstance from "@/lib/config/axios.config";
import config from "../../config/req.header.config";

// Pass userId as an argument, or ensure it's in formData
export const updateUser = async (userId, formData) => {
  if (!userId) {
    console.error("updateUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.put(
      `/api/users/update/${userId}`,
      formData,
      config
    );
    return res.data;
  } catch (e) {
    console.error("Error updating users:", e.message);
    return null;
  }
};
