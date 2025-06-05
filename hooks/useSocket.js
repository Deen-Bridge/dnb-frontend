import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Determine the socket URL based on environment
const SOCKET_URL = isDevelopment
  ? "http://localhost:5000"
  : process.env.NEXT_PUBLIC_SOCKET_URL ||
    "https://dnb-backend-api.onrender.com";

console.log("🔌 Socket configuration:", {
  url: SOCKET_URL,
  environment: process.env.NODE_ENV,
  isDevelopment,
});

export const useChatSocket = ({ conversationId, onMessage }) => {
  const socket = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isInRoom, setIsInRoom] = useState(false);
  const messageQueue = useRef([]);
  const isConnecting = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const joinRoomAttempts = useRef(0);
  const maxJoinRoomAttempts = 3;
  const onMessageRef = useRef(onMessage);
  const processedMessageIds = useRef(new Set());

  // Update onMessageRef when onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const joinRoom = useCallback(() => {
    if (!socket.current?.connected || !conversationId) {
      console.log("Cannot join room:", {
        connected: socket.current?.connected,
        conversationId,
      });
      return;
    }

    console.log(`Attempting to join room: ${conversationId}`);
    socket.current.emit("joinRoom", { conversationId }, (response) => {
      if (response?.error) {
        console.error("Error joining room:", response.error);
        if (joinRoomAttempts.current < maxJoinRoomAttempts) {
          joinRoomAttempts.current += 1;
          setTimeout(joinRoom, 1000 * joinRoomAttempts.current);
        }
        return;
      }
      console.log(`Successfully joined room: ${conversationId}`);
      setIsInRoom(true);
      joinRoomAttempts.current = 0;
    });
  }, [conversationId]);

  // Function to initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socket.current || isConnecting.current) {
      console.log("Socket already exists or is connecting");
      return;
    }

    isConnecting.current = true;
    console.log("Initializing socket connection to:", SOCKET_URL);

    // Get auth token from cookies
    const token = Cookies.get("authToken");
    console.log("🔑 Auth token from cookies:", token ? "Present" : "Missing");
    console.log("🔑 Auth token value:", token);

    const socketConfig = {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
      forceNew: true,
      path: "/socket.io",
      autoConnect: true,
      auth: {
        token: token || undefined,
      },
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    };

    console.log("Socket.IO client configuration:", socketConfig);

    socket.current = io(SOCKET_URL, socketConfig);

    const handleConnect = () => {
      console.log("Socket connected successfully");
      console.log("Socket transport:", socket.current.io.engine.transport.name);
      setConnectionStatus("connected");
      isConnecting.current = false;
      reconnectAttempts.current = 0;

      // Join room after connection is established
      joinRoom();

      // Process any queued messages
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        sendMessage(message);
      }
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
      setIsInRoom(false);
      isConnecting.current = false;

      // If the disconnection was not initiated by the client, try to reconnect
      if (
        reason !== "io client disconnect" &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        reconnectAttempts.current += 1;
        console.log(
          `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`
        );
        setTimeout(() => {
          if (socket.current) {
            socket.current.connect();
          }
        }, 1000 * reconnectAttempts.current);
      }
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setConnectionStatus("error");
      setIsInRoom(false);
      isConnecting.current = false;
    };

    const handleRoomJoined = ({ conversationId: roomId }) => {
      console.log(`Successfully joined room: ${roomId}`);
      setIsInRoom(true);
    };

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);

      // Check if we've already processed this message
      const messageId = data._id || data.tempId;
      if (processedMessageIds.current.has(messageId)) {
        console.log("Message already processed, skipping:", messageId);
        return;
      }

      // Add message ID to processed set
      processedMessageIds.current.add(messageId);

      // Clean up old message IDs (keep last 100)
      if (processedMessageIds.current.size > 100) {
        const ids = Array.from(processedMessageIds.current);
        processedMessageIds.current = new Set(ids.slice(-100));
      }

      if (onMessageRef.current) {
        onMessageRef.current(data);
      }
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      setConnectionStatus("error");
    };

    const handleUserStatus = (data) => {
      console.log("User status update:", data);
    };

    // Socket event listeners
    socket.current.on("connect", handleConnect);
    socket.current.on("disconnect", handleDisconnect);
    socket.current.on("connect_error", handleConnectError);
    socket.current.on("roomJoined", handleRoomJoined);
    socket.current.on("receiveMessage", handleReceiveMessage);
    socket.current.on("error", handleError);
    socket.current.on("userStatus", handleUserStatus);

    // Connect the socket
    socket.current.connect();
  }, [joinRoom]);

  // Effect to initialize socket when component mounts
  useEffect(() => {
    // Wait a short time to ensure cookies are available
    const timer = setTimeout(() => {
      initializeSocket();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (socket.current) {
        console.log("Cleaning up socket connection");
        socket.current.off("connect");
        socket.current.off("disconnect");
        socket.current.off("connect_error");
        socket.current.off("roomJoined");
        socket.current.off("receiveMessage");
        socket.current.off("error");
        socket.current.off("userStatus");
        socket.current.disconnect();
      }
    };
  }, [initializeSocket]);

  const sendMessage = (message) => {
    if (!socket.current?.connected) {
      console.log("Socket not connected, queueing message");
      messageQueue.current.push(message);
      return;
    }
    if (!isInRoom) {
      console.log("Not in room, attempting to join...");
      joinRoom();
      messageQueue.current.push(message);
      return;
    }
    console.log("Sending message:", message);

    // Generate a temporary ID for the message
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Ensure message format matches backend expectation
    const formattedMessage = {
      ...message,
      text: message.content || message.text, // Support both formats
      timestamp: message.timestamp || new Date().toISOString(),
      tempId, // Add temporary ID
    };

    // Add to processed messages immediately to prevent duplicates
    processedMessageIds.current.add(tempId);

    socket.current.emit("sendMessage", formattedMessage, (response) => {
      if (response?.error) {
        console.error("Error sending message:", response.error);
        // Remove from processed messages if there was an error
        processedMessageIds.current.delete(tempId);
        // Retry sending the message
        setTimeout(() => {
          sendMessage(message);
        }, 1000);
        return;
      }
      // Message was successfully sent
      console.log("Message sent successfully");
    });
  };

  return { sendMessage, connectionStatus, isInRoom };
};
