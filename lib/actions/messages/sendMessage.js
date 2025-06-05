import axiosInstance from "@/lib/config/axios.config";

export const sendMessage = async (socket, message) => {
  if (!message.conversationId) return;

  // Send through socket if available
  if (socket) {
    socket.emit("sendMessage", message);
  }

  try {
    // Always persist to database
    const response = await axiosInstance.post("/api/messages", message);
    return response.data;
  } catch (err) {
    console.error("Error sending message:", err);
    throw err;
  }
};
