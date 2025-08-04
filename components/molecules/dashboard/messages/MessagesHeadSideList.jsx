"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchUserConversations } from "@/lib/actions/messages/fetchConversations";
import { useAuth } from "@/hooks/useAuth";
import { format, isValid } from "date-fns";
import { ChatHeadListSkeleton } from "@/components/atoms/skeletons/ChatHeadListSkeleton";
import { getUserById } from "@/lib/actions/users/getUserById";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const MessagesHeadSideList = () => {
  const unreadCounts = useUnreadMessages(); // { conversationId: count }
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({});
  const [fetchingUsers, setFetchingUsers] = useState(new Set());
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadConversations = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const convos = await fetchUserConversations(user._id);
        setConversations(convos);
      } catch (err) {
        console.log("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user._id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?._id]);

  useEffect(() => {
    if (!conversations.length) return;
    const idsToFetch = [];
    conversations.forEach((conv) => {
      conv.participants.forEach((id) => {
        if (id !== user?._id && !userCache[id] && !fetchingUsers.has(id)) {
          idsToFetch.push(id);
        }
      });
    });
    if (idsToFetch.length === 0) return;
    setFetchingUsers((prev) => new Set([...prev, ...idsToFetch]));
    Promise.all(
      idsToFetch.map(async (id) => {
        const res = await getUserById(id);
        return { id, user: res?.user };
      })
    ).then((results) => {
      setUserCache((prev) => {
        const updated = { ...prev };
        results.forEach(({ id, user }) => {
          if (user) updated[id] = user;
        });
        return updated;
      });
      setFetchingUsers((prev) => {
        const updated = new Set(prev);
        idsToFetch.forEach((id) => updated.delete(id));
        return updated;
      });
    });
  }, [conversations]);

  const getOtherParticipant = (participants) => {
    const otherId = participants.find((p) => p !== user?._id);
    return userCache[otherId] || null;
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/dashboard/messages/${conversationId}`);
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    const getTime = (msg) => {
      return (
        msg?.timestamp?.toDate?.() ||
        (typeof msg?.timestamp === "string" ||
          typeof msg?.timestamp === "number"
          ? new Date(msg.timestamp)
          : undefined) ||
        (typeof msg?.createdAt === "string" ||
          typeof msg?.createdAt === "number"
          ? new Date(msg.createdAt)
          : undefined) ||
        new Date(0)
      );
    };

    return getTime(b.lastMessage) - getTime(a.lastMessage);
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
            const unreadCount = unreadCounts[conversation._id] || 0;

            return (
              <button
                key={conversation._id}
                onClick={() => handleConversationClick(conversation._id)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent/10 hover:bg-accent/20"
                    : "hover:bg-muted/80"
                )}
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 rounded-lg">
                    {otherParticipant?.avatar ? (
                      <AvatarImage src={otherParticipant.avatar} />
                    ) : (
                      <AvatarFallback>
                        {otherParticipant?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate font-stretch-125%">
                        {otherParticipant?.name || "Loading..."}
                      </span>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {(() => {
                            let rawTime =
                              lastMessage.timestamp?.toDate?.() ||
                              (typeof lastMessage.timestamp === "string" ||
                                typeof lastMessage.timestamp === "number"
                                ? new Date(lastMessage.timestamp)
                                : undefined) ||
                              (typeof lastMessage.createdAt === "string" ||
                                typeof lastMessage.createdAt === "number"
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
                    <span
                      className={cn(
                        "flex items-start text-sm truncate",
                        unreadCount
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {lastMessage?.text || "No messages yet"}
                    </span>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <div className="ml-auto">
                    <div className="min-w-[20px] text-xs text-white bg-red-500 px-2 py-0.5 rounded-full text-center">
                      {unreadCount}
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesHeadSideList;
