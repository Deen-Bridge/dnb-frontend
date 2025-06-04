import axiosInstance from "@/lib/config/axios.config";

export const fetchConversations = async () => {
  try {
    const res = await axiosInstance.get("/api/messages/conversations");
    return res.data;
  } catch (err) {
    console.error("Error fetching conversations:", err);
    if (err.response?.status === 401) {
      console.error("Unauthorized access");
    }
    return [];
  }
};
