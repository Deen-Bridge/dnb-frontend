import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";
export const updateSpace = async (spaceId, updates, token) => {
  try {
    const res = await axiosInstance.put(
      `/api/spaces/update/${spaceId}`,
      updates,
      config
    );
    return res.data;
  } catch (error) {
    // You can handle error as needed
    throw error.response?.data || error;
  }
};
