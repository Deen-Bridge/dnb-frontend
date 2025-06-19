"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchUserConversations } from "@/lib/actions/messages/fetchConversations";
import { useAuth } from "@/hooks/useAuth";
import { format, isValid } from "date-fns";
import { ChatHeadListSkeleton } from "@/components/atoms/skeletons/ChatHeadListSkeleton";
import { getUserById } from "@/lib/actions/users/getUserById";

const MessagesHeadSideList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({});
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadConversations = async () => {
      if (!user?._id) return; // ✅ Add guard

      try {
        setLoading(true);
        const convos = await fetchUserConversations(user._id);
        setConversations(convos);
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?._id]);

  // Fetch user info for all other participants
  useEffect(() => {
    const ids = new Set();
    conversations.forEach(conv => {
      conv.participants.forEach(id => {
        if (id !== user?._id && !userCache[id]) ids.add(id);
      });
    });
    ids.forEach(async id => {
      if (!userCache[id]) {
        const res = await getUserById(id);
        setUserCache(prev => ({ ...prev, [id]: res?.user }));
      }
    });
    // eslint-disable-next-line
  }, [conversations]);

  const getOtherParticipant = (participants) => {
    const otherId = participants.find((p) => p !== user?._id);
    return userCache[otherId];
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/dashboard/messages/${conversationId}`);
  };

  // Sort conversations by last message time (descending)
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime =
      a.lastMessage?.timestamp?.toDate?.() ||
      (typeof a.lastMessage?.timestamp === "string" || typeof a.lastMessage?.timestamp === "number"
        ? new Date(a.lastMessage.timestamp)
        : undefined) ||
      (typeof a.lastMessage?.createdAt === "string" || typeof a.lastMessage?.createdAt === "number"
        ? new Date(a.lastMessage.createdAt)
        : undefined) ||
      new Date(0); // fallback to epoch if no date

    const bTime =
      b.lastMessage?.timestamp?.toDate?.() ||
      (typeof b.lastMessage?.timestamp === "string" || typeof b.lastMessage?.timestamp === "number"
        ? new Date(b.lastMessage.timestamp)
        : undefined) ||
      (typeof b.lastMessage?.createdAt === "string" || typeof b.lastMessage?.createdAt === "number"
        ? new Date(b.lastMessage.createdAt)
        : undefined) ||
      new Date(0);

    return bTime - aTime;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">Messages</div>
      <div className="flex flex-col gap-2">
        {loading ? (
          <ChatHeadListSkeleton />
        ) : sortedConversations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No conversations yet
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(
              conversation.participants
            );
            const lastMessage = conversation.lastMessage;
            const isActive =
              pathname === `/dashboard/messages/${conversation._id}`;

            return (
              <button
                key={conversation._id}
                onClick={() => handleConversationClick(conversation._id)}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${isActive
                  ? "bg-accent/10 hover:bg-accent/20"
                  : "hover:bg-muted/80"
                  }`}
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={otherParticipant?.avatar} />
                    <AvatarFallback>
                      {otherParticipant?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">
                        {otherParticipant?.name}
                      </span>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {(() => {
                            let rawTime =
                              lastMessage.timestamp?.toDate?.() ||
                              (typeof lastMessage.timestamp === "string" || typeof lastMessage.timestamp === "number"
                                ? new Date(lastMessage.timestamp)
                                : undefined) ||
                              (typeof lastMessage.createdAt === "string" || typeof lastMessage.createdAt === "number"
                                ? new Date(lastMessage.createdAt)
                                : undefined) ||
                              undefined;
                            if (rawTime && isValid(rawTime)) {
                              return format(rawTime, "h:mm a");
                            }
                            return "--:--";
                          })()}
                        </span>
                      )}
                    </div>
                    <span className="flex items-start text-sm text-muted-foreground truncate">
                      {lastMessage?.text || "No messages yet"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesHeadSideList;
