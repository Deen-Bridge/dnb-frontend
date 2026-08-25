import axiosInstance from "@/lib/config/axios.config";

export const getUserById = async (userId) => {
  if (!userId) {
    console.log("getUserById: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}`);
    console.log("getUserById response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching user:", e.message);
    return null;
  }
};
