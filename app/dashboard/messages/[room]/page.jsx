"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Users, Globe } from "lucide-react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { isValid, format } from "date-fns";
import { listenToMessages } from "@/lib/actions/messages/fetchMessages";
import { fetchUserConversations } from "@/lib/actions/messages/fetchConversations";
import { sendMessage } from "@/lib/actions/messages/sendMessage";
import { getUserById } from "@/lib/actions/users/getUserById";
import { setTyping } from "@/lib/actions/messages/typing";
import { listenToTyping } from "@/lib/actions/messages/listen-to-typing";
import Link from "next/link";
import Loader from "@/components/molecules/loaders/rootLoader";


export default function Page({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { room } = React.use(params); // Unwrap params for Next.js 14+

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [otherParticipantInfo, setOtherParticipantInfo] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);

  // Listen to messages
  useEffect(() => {
    if (!room) return;
    const unsubscribe = listenToMessages(room, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [room]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversations and set current
  useEffect(() => {
    const loadConversations = async () => {
      if (!user || !user._id || !room) return;
      try {
        const convos = await fetchUserConversations(user._id);
        setConversations(convos);
        const current = convos.find((conv) => conv._id === room);
        setCurrentConversation(current);
      } catch (err) {
        console.log("Error loading conversations:", err);
      }
    };
    loadConversations();
  }, [room, user?._id]);

  // Fetch other participant info
  useEffect(() => {
    const fetchOtherParticipant = async () => {
      if (!currentConversation || !user?._id || !Array.isArray(currentConversation.participants)) return;
      const otherId = currentConversation.participants.find(id => id !== user._id);
      if (!otherId) return;
      // Check cache first
      if (userCache[otherId]) {
        setOtherParticipantInfo(userCache[otherId]);
        return;
      }
      try {
        const res = await getUserById(otherId);
        if (res?.user) {
          setOtherParticipantInfo(res.user);
          setUserCache(prev => ({ ...prev, [otherId]: res.user }));
        }
      } catch (error) {
        console.log("Failed to fetch other participant info:", error);
      }
    };
    fetchOtherParticipant();
  }, [currentConversation, user?._id, userCache]);

  // Fetch user info for all senders (for avatars)
  useEffect(() => {
    const uniqueSenderIds = [...new Set(messages.map(m => m.senderId))];
    uniqueSenderIds.forEach(async id => {
      if (!userCache[id]) {
        const res = await getUserById(id);
        setUserCache(prev => ({ ...prev, [id]: res?.user }));
      }
    });
    // eslint-disable-next-line
  }, [messages]);
  useEffect(() => {
    if (!room) return;
    const unsubscribe = listenToTyping(room, setTypingUsers);
    return () => unsubscribe();
  }, [room]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await sendMessage(room, user._id, newMessage);
      setNewMessage("");
    } catch (error) {
      console.log("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };


  return (
    <div className="flex h-full w-full flex-col overflow-hidden overscroll-none">
      <div className="flex items-center gap-2 p-2 sm:p-4 border-t border-b bg-accent/10 border-b-accent/20 rounded-t-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => router.push("/dashboard/messages")}
          aria-label="Back to messages list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href={`/account/profile/${otherParticipantInfo?._id}`}>
          <Avatar className="h-10 w-10 sm:h-13 sm:w-13">
            <AvatarImage src={otherParticipantInfo?.avatar} />
            <AvatarFallback>{otherParticipantInfo?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/account/profile/${otherParticipantInfo?._id}`}>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold font-stretch-125% text-sm sm:text-base truncate">
              {otherParticipantInfo?.name}
            </h2>
            <p className="text-xs sm:text-sm text-accent">Active now</p>
            {/* // Show typing indicator */}
            {Object.entries(typingUsers).map(([uid, isTyping]) =>
              uid !== user._id && isTyping ? (
                <p key={uid} className="text-xs text-muted-foreground">
                  typing...
                </p>
              ) : null
            )}
          </div>
        </Link>
        <div className="text-xs sm:text-sm text-green-500">🟢</div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 scrollbar-hide">
        {isLoading ? (
        <Loader/>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm sm:text-base">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwnMessage = msg.senderId === user?._id;
            const showAvatar =
              !isOwnMessage &&
              (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
            const isConsecutiveMessage =
              i > 0 && messages[i - 1]?.senderId === msg.senderId;
            const rawTime = msg.timestamp?.toDate?.() // Firestore Timestamp object
              || msg.timestamp // ISO string or Date
              || msg.createdAt
              || msg.created_at
              || null;

            let displayTime = "";
            if (rawTime) {
              const dateObj = rawTime instanceof Date ? rawTime : new Date(rawTime);
              if (isValid(dateObj)) {
                displayTime = format(dateObj, "HH:mm");
              }
            }
            const showTime =
              i === messages.length - 1 ||
              messages[i + 1]?.senderId !== msg.senderId;

            const messageTime =
              msg.createdAt || msg.timestamp || new Date().toISOString();

            const sender = userCache[msg.senderId];

            return (
              <div
                key={msg._id || i}
                className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"
                  } ${isConsecutiveMessage ? "mt-1" : "mt-4"}`}
              >
                {showAvatar && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage
                        src={sender?.avatar}
                        alt={sender?.name}
                      />
                      <AvatarFallback>
                        {sender?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {!showAvatar && <div className="w-6 sm:w-8" />}
                <div
                  className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"
                    } max-w-[85%] sm:max-w-[70%]`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm ${isOwnMessage
                      ? "bg-accent text-white rounded-tr-none"
                      : "bg-muted rounded-tl-none"
                      } shadow-sm`}
                  >
                    {msg.text || msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {showTime &&
                      (() => {
                        try {
                          const d = msg.timestamp?.toDate?.() || msg.timestamp || msg.createdAt;
                          return d ? format(new Date(d), "HH:mm") : "--:--";
                        } catch {
                          return "--:--";
                        }
                      })()
                    }
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="border-b-4 rounded-b-2xl p-2 sm:p-4 bg-accent/10 "
        onSubmit={handleSendMessage}
      >
        <div className="flex relative max-w-4xl mx-auto gap-4">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => {
              setNewMessage(e.target.value);
              setTyping(room, user._id, true);
              // Optionally, debounce and set to false after user stops typing
            }}
            onBlur={() => setTyping(room, user._id, false)}
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
