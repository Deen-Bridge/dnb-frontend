"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchConversations } from "@/lib/actions/messages/fetchConversations";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ChatHeadListSkeleton } from "@/components/atoms/skeletons/ChatHeadListSkeleton";

const MessagesHeadSideList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const convos = await fetchConversations();
        setConversations(convos);
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p._id !== user?._id);
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/dashboard/messages/${conversationId}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">Messages</div>
      <div className="flex flex-col gap-2">
        {loading ? (
          <ChatHeadListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => {
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
                className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                  isActive
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
                          {format(new Date(lastMessage.createdAt), "h:mm a")}
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
