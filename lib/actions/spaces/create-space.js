import axiosInstance from "@/lib/config/axios.config";

// Call this function from your frontend to create a space
export const createSpace = async (formData) => {
  try {
    const res = await axiosInstance.post("/api/spaces", formData);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};
