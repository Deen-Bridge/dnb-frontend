"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchConversations } from "@/lib/actions/messages/fetchConversations";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const MessagesHeadSideList = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

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

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p._id !== user?._id);
  };

  return (
    <div
      className="relative flex flex-col items-start gap-8"
      x-chunk="dashboard-03-chunk-0"
    >
      <div className="text-3xl font-extrabold">Chats</div>
      <div className="grid w-full items-start gap-6 ">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(
            conversation.participants
          );
          const lastMessage = conversation.lastMessage;

          return (
            <Link
              href={`/dashboard/messages/${conversation._id}`}
              key={conversation._id}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarImage src={otherParticipant?.avatar} />
                    <AvatarFallback>
                      {otherParticipant?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col pt-1">
                    <span className="font-semibold text-base">
                      {otherParticipant?.name}
                    </span>
                    <span className="font-light text-sm">
                      {lastMessage?.text || "No messages yet"}
                    </span>
                  </div>
                </div>
                {lastMessage && (
                  <div className="text-sm">
                    {format(new Date(lastMessage.createdAt), "h:mm a")}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesHeadSideList;
