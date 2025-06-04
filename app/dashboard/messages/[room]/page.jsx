"use client";
import { useState, useEffect, use } from "react";
import { useChatSocket } from "@/hooks/useSocket";
import { fetchMessages } from "@/lib/actions/messages/fetchMessages";
import { fetchConversations } from "@/lib/actions/messages/fetchConversations";
import { sendMessage as sendMessageAPI } from "@/lib/actions/messages/sendMessage";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, Paperclip, ImageIcon } from "lucide-react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import Link from "next/link";

export default function Page({ params }) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  const room = resolvedParams.room;
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { sendMessage, connectionStatus } = useChatSocket({
    conversationId: room,
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
      setError(null);
    },
  });

  // Update connection status when it changes
  useEffect(() => {
    setIsConnected(connectionStatus === "connected");
  }, [connectionStatus]);

  // Fetch conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convos = await fetchConversations();
        setConversations(convos);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };
    loadConversations();
  }, []);

  // Fetch messages for current room
  useEffect(() => {
    const loadMessages = async () => {
      if (!room) return;

      setIsLoading(true);
      try {
        const msgs = await fetchMessages(room);
        setMessages(msgs);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: room,
      text: newMessage,
      sender: user?._id,
    };

    try {
      if (!isConnected) {
        setError("Not connected to chat server. Please refresh the page.");
        return;
      }

      sendMessage(messageData); // realtime
      await sendMessageAPI(null, messageData); // persist
      setNewMessage(""); // clears input
      setError(null);
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 bg-highlight/20 rounded-xl relative hidden md:flex h-full flex-col p-4">
        <div className="flex justify-end items-center mb-4">
         
          <div
            className={`text-sm ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {isConnected ? "🟢" : "🔴"}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto space-y-4 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwnMessage = msg.sender?._id === user?._id;
              return (
                <div
                  key={msg._id || i}
                  className={`flex items-start gap-2 ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage
                        src={msg?.sender?.avatar || "/images/placeholder.jpg"}
                        alt={msg?.sender?.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg">
                        {msg?.sender?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className={`flex flex-col ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {msg.sender?.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        isOwnMessage
                          ? "bg-accent text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          className="relative overflow-hidden rounded-lg bottom-0 border bg-background focus-within:ring-1 focus-within:ring-accent mt-4"
          onSubmit={handleSend}
        >
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          />

          <div className="flex justify-between items-center p-3 pt-0">
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach File</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="size-4" />
                    <span className="sr-only">Attach Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach Image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Use Microphone</TooltipContent>
              </Tooltip>
            </div>
            <div>
              <Button
                round
                type="submit"
                className="text-sm ml-auto p-3 mb-2 rounded-full gap-1.5 text-white flex justify-end bg-accent hover:bg-highlight"
              >
                <FiSend className="size-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
