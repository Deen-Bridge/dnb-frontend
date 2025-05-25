import axios from "axios";
import config from "../config/req.header.config";

// Pass userId as an argument, or ensure it's in formData
export const updateUser = async (userId, formData) => {
  try {
    const res = await axios.put(
      `https://dnb-backend-api.onrender.com/api/users/${userId}`,
      formData,
      config
    );
    return res.data;
  } catch (e) {
    console.error("Error updating users:", e.message);
    return null;
  }
};