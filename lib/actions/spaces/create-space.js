import axios from "axios";
import config from "@/lib/config/req.header.config";

// Call this function from your frontend to create a space
export const createSpace = async (formData) => {
  try {
    const res = await axios.post(
      "https://dnb-backend-api.onrender.com/api/spaces",
      formData,
      config
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};
