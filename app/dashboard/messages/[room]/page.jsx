"use client";
import { use, useState, useEffect, useRef } from "react";
import { useChatSocket } from "@/hooks/useSocket";
import { fetchMessages } from "@/lib/actions/messages/fetchMessages";
import { fetchConversations } from "@/lib/actions/messages/fetchConversations";
import { sendMessage as sendMessageAPI } from "@/lib/actions/messages/sendMessage";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Users, Globe } from "lucide-react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useRouter, usePathname } from "next/navigation";

export default function Page({ params }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const room = resolvedParams.room;
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { sendMessage, connectionStatus } = useChatSocket({
    conversationId: room,
    onMessage: (msg) => {
      console.log("Received new message:", msg);
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some(
          (m) =>
            m._id === msg._id ||
            (m.text === msg.text &&
              m.sender === msg.sender &&
              m.timestamp === msg.timestamp)
        );
        if (exists) {
          return prev;
        }
        // Add message to the end of the array
        const newMessages = [...prev, msg];
        // Sort messages by timestamp
        return newMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB;
        });
      });
      setError(null);
    },
  });

  // Update connection status when it changes
  useEffect(() => {
    setIsConnected(connectionStatus === "connected");
  }, [connectionStatus]);

  // Fetch conversations and set current conversation
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convos = await fetchConversations();
        setConversations(convos);
        const current = convos.find((conv) => conv._id === room);
        setCurrentConversation(current);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };
    loadConversations();
  }, [room]);

  // Fetch messages for current room
  useEffect(() => {
    const loadMessages = async () => {
      if (!room) return;

      setIsLoading(true);
      try {
        const msgs = await fetchMessages(room);
        // Sort messages by timestamp
        const sortedMessages = msgs.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.timestamp).getTime();
          const timeB = new Date(b.createdAt || b.timestamp).getTime();
          return timeA - timeB;
        });
        setMessages(sortedMessages);
        setError(null);
      } catch (err) {
        setError("Failed to load messages");
        console.error("Error loading messages:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [room]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        conversationId: room,
        text: newMessage,
        sender: user._id,
        timestamp: new Date().toISOString(),
      };

      // Optimistically add message to UI
      setMessages((prev) => {
        const newMessages = [...prev, messageData];
        return newMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB;
        });
      });
      setNewMessage("");

      // Send message through socket
      try {
        sendMessage(messageData);
      } catch (error) {
        console.error("Socket error:", error);
        // Don't remove from UI, just log the error
        // The message will be resent when socket reconnects
      }

      // Also persist to database
      try {
        await sendMessageAPI(null, messageData);
      } catch (err) {
        console.error("Error persisting message:", err);
        // Don't remove from UI, just log the error
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Add a useEffect to handle socket reconnection
  useEffect(() => {
    if (connectionStatus === "connected" && room) {
      // Reload messages when socket reconnects
      const loadMessages = async () => {
        try {
          const msgs = await fetchMessages(room);
          // Sort messages by timestamp
          const sortedMessages = msgs.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.timestamp).getTime();
            const timeB = new Date(b.createdAt || b.timestamp).getTime();
            return timeA - timeB;
          });
          setMessages(sortedMessages);
          setError(null);
        } catch (err) {
          console.error("Error reloading messages:", err);
        }
      };
      loadMessages();
    }
  }, [connectionStatus, room]);

  const getOtherParticipant = () => {
    if (!currentConversation) return null;
    return currentConversation.participants.find((p) => p._id !== user?._id);
  };

  const otherParticipant = getOtherParticipant();

  // If no room is selected, show welcome message
  if (!room) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 sm:p-6 text-center bg-muted/50">
        <div className="max-w-md space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Welcome to DeenBridge Messages
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with Muslims around the world through meaningful
              conversations
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 text-left">
            <div className="flex items-start gap-2 sm:gap-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-medium">
                  Connect with Others
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Find and chat with Muslims who share your interests
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-medium">
                  Global Community
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Exchange ideas and experiences with Muslims worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-2 p-2 sm:p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm sm:text-base truncate">
            {otherParticipant?.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {connectionStatus === "connected" ? "Online" : "Offline"}
          </p>
        </div>
        <div
          className={`text-xs sm:text-sm ${
            connectionStatus === "connected" ? "text-green-500" : "text-red-500"
          }`}
        >
          {connectionStatus === "connected" ? "🟢" : "🔴"}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-accent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm sm:text-base">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwnMessage =
              msg.sender === user?._id || msg.sender?._id === user?._id;
            const showAvatar =
              !isOwnMessage &&
              (i === 0 ||
                messages[i - 1]?.sender === msg.sender ||
                messages[i - 1]?.sender?._id === msg.sender?._id);
            const isConsecutiveMessage =
              i > 0 &&
              (messages[i - 1]?.sender === msg.sender ||
                messages[i - 1]?.sender?._id === msg.sender?._id);
            const showTime =
              i === messages.length - 1 ||
              messages[i + 1]?.sender !== msg.sender ||
              messages[i + 1]?.sender?._id !== msg.sender?._id;

            // Get timestamp from message, fallback to current time if not available
            const messageTime =
              msg.createdAt || msg.timestamp || new Date().toISOString();

            return (
              <div
                key={msg._id || i}
                className={`flex items-end gap-2 ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                } ${isConsecutiveMessage ? "mt-1" : "mt-4"}`}
              >
                {showAvatar && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage
                        src={msg?.sender?.avatar}
                        alt={msg?.sender?.name}
                      />
                      <AvatarFallback>
                        {msg?.sender?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {!showAvatar && <div className="w-6 sm:w-8" />}
                <div
                  className={`flex flex-col ${
                    isOwnMessage ? "items-end" : "items-start"
                  } max-w-[85%] sm:max-w-[70%]`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm ${
                      isOwnMessage
                        ? "bg-accent text-white rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    } shadow-sm`}
                  >
                    {msg.text || msg.content}
                  </div>
                  {showTime && (
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {format(new Date(messageTime), "HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        className="border-t p-2 sm:p-4 bg-background"
        onSubmit={handleSendMessage}
      >
        <div className="flex relative max-w-4xl mx-auto">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[40px] sm:min-h-[44px] resize-none pr-10 sm:pr-12 rounded-full border-none shadow-none focus:outline-none bg-muted/50 text-sm sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            round
            type="submit"
            size="icon"
            className="absolute right-1 h-8 w-8 sm:h-10 sm:w-10 text-white font-thin bg-accent hover:bg-accent/90"
            disabled={!newMessage.trim()}
          >
            <FiSend className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
