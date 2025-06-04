export const setupReceiveMessage = (socket, setMessages) => {
  if (!socket) return;

  const handler = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  socket.on("receiveMessage", handler);

  return () => {
    socket.off("receiveMessage", handler);
  };
};
