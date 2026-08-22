import axiosInstance from "@/lib/config/axios.config";
export const updateSpace = async (spaceId, updates, token) => {
  try {
    const res = await axiosInstance.put(
      `/api/spaces/update/${spaceId}`,
      updates
    );
    return res.data;
  } catch (error) {
    // You can handle error as needed
    throw error.response?.data || error;
  }
};
