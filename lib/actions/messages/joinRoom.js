export const joinRoom = (socket, conversationId) => {
  if (socket && conversationId) {
    socket.emit("joinRoom", { conversationId });
  }
};
