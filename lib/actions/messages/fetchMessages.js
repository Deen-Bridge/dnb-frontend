import axiosInstance from "@/lib/config/axios.config";

export const fetchMessages = async (conversationId) => {
  if (!conversationId) {
    console.error("No conversation ID provided");
    return [];
  }

  try {
    const res = await axiosInstance.get(`/api/messages/${conversationId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching messages:", err);
    if (err.response?.status === 404) {
      console.error("Conversation not found");
    }
    return [];
  }
};
