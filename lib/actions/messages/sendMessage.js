import axiosInstance from "@/lib/config/axios.config";

export const sendMessage = async (socket, message) => {
  if (!socket || !message.conversationId) return;

  socket.emit("sendMessage", message);

  try {
    await axiosInstance.post("http://localhost:5000/api/messages", message, {
      withCredentials: true,
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};
