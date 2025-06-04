import axios from "axios";

export const sendMessage = async (socket, message) => {
  if (!socket || !message.conversationId) return;

  socket.emit("sendMessage", message);

  try {
    await axios.post("http://localhost:5000/api/messages", message, {
      withCredentials: true,
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};
