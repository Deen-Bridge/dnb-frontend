import axios from "axios";
import config from "@/lib/config/req.header.config";

export const getUserById = async (userId) => {
  if (!userId) {
    console.error("getUserById: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axios.get(
      `https://dnb-backend-api.onrender.com/api/users/${userId}`, config
    );
    return res.data;
  } catch (e) {
    console.error("Error fetching user:", e.message);
    return null;
  }
};
