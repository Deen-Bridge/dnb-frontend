import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

if (!process.env.NEXT_PUBLIC_SOCKET_URL && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "Socket URL is not defined in environment variables. Using default URL."
  );
}

export const useChatSocket = ({ conversationId, onMessage }) => {
  const socket = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("Socket connected");
      setConnectionStatus("connected");
      // Join room after connection is established
      if (conversationId) {
        socket.current.emit("joinRoom", { conversationId });
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setConnectionStatus("disconnected");
      setIsInRoom(false);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setConnectionStatus("error");
      setIsInRoom(false);
    };

    const handleRoomJoined = ({ conversationId: roomId }) => {
      console.log(`Successfully joined room: ${roomId}`);
      setIsInRoom(true);
    };

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);
      onMessage(data);
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      setConnectionStatus("error");
    };

    // Socket event listeners
    socket.current.on("connect", handleConnect);
    socket.current.on("disconnect", handleDisconnect);
    socket.current.on("connect_error", handleConnectError);
    socket.current.on("roomJoined", handleRoomJoined);
    socket.current.on("receiveMessage", handleReceiveMessage);
    socket.current.on("error", handleError);

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.off("connect", handleConnect);
        socket.current.off("disconnect", handleDisconnect);
        socket.current.off("connect_error", handleConnectError);
        socket.current.off("roomJoined", handleRoomJoined);
        socket.current.off("receiveMessage", handleReceiveMessage);
        socket.current.off("error", handleError);
        socket.current.disconnect();
      }
    };
  }, [conversationId, onMessage]);

  const sendMessage = (message) => {
    if (!socket.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    if (!isInRoom) {
      console.error("Not in room");
      throw new Error("Not in room");
    }
    console.log("Sending message:", message);
    socket.current.emit("sendMessage", message);
  };

  return { sendMessage, connectionStatus, isInRoom };
};
