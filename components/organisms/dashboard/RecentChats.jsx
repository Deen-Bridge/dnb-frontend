"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Inter_500 } from "@/lib/config/font.config";
import useAuth from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";
import { getUserById } from "@/lib/actions/users/getUserById";
import { formatDistanceToNow } from "date-fns";

const RecentChats = () => {
  const { user } = useAuth();
  const unreadCounts = useUnreadMessages();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({});
  const fetchingUsersRef = useRef(new Set());

  useEffect(() => {
    if (!user?._id) return;

    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user._id)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
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
    if (!conversations.length || !user?._id) return;

    const idsToFetch = [];
    conversations.forEach((conversation) => {
      conversation.participants?.forEach((participantId) => {
        if (
          participantId !== user._id &&
          !userCache[participantId] &&
          !fetchingUsersRef.current.has(participantId)
        ) {
          idsToFetch.push(participantId);
        }
      });
    });

    if (idsToFetch.length === 0) return;

    idsToFetch.forEach((id) => fetchingUsersRef.current.add(id));

    Promise.all(
      idsToFetch.map(async (participantId) => {
        try {
          const response = await getUserById(participantId);
          return { participantId, user: response?.user || null };
        } catch (error) {
          console.error("Failed to fetch user for recent chats:", error);
          return { participantId, user: null };
        }
      })
    ).then((results) => {
      setUserCache((prev) => {
        const updated = { ...prev };
        results.forEach(({ participantId, user: fetchedUser }) => {
          if (fetchedUser) {
            updated[participantId] = fetchedUser;
          }
        });
        return updated;
      });
      idsToFetch.forEach((id) => fetchingUsersRef.current.delete(id));
    });
  }, [conversations, user?._id]);

  const sortedConversations = useMemo(() => {
    const sortByTimestamp = (conversation) => {
      const lastMessage = conversation.lastMessage || {};
      const rawTimestamp =
        lastMessage.timestamp?.toDate?.() ||
        lastMessage.timestamp ||
        lastMessage.createdAt ||
        conversation.updatedAt ||
        conversation.createdAt;

      const date = rawTimestamp ? new Date(rawTimestamp) : null;
      return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
    };

    return [...conversations]
      .sort((a, b) => sortByTimestamp(b) - sortByTimestamp(a))
      .slice(0, 3);
  }, [conversations]);

  const renderContent = () => {
    if (loading) {
      return (
        <ul className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg bg-muted/60 p-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-muted" />
                  <div className="h-3 w-32 rounded-full bg-muted" />
                </div>
              </div>
              <div className="h-5 w-5 rounded-full bg-muted" />
            </li>
          ))}
        </ul>
      );
    }

    if (sortedConversations.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
          No recent conversations yet.
        </div>
      );
    }

    return (
      <ul className="space-y-2 text-sm">
        {sortedConversations.map((conversation) => {
          const otherParticipantId = conversation.participants?.find(
            (participantId) => participantId !== user?._id
          );
          const otherParticipant =
            (otherParticipantId && userCache[otherParticipantId]) || null;
          const unreadCount = unreadCounts[conversation._id] || 0;
          const lastMessage = conversation.lastMessage || {};
          const lastMessageText =
            lastMessage.text || lastMessage.preview || "Start a conversation";

          const rawTimestamp =
            lastMessage.timestamp?.toDate?.() ||
            lastMessage.timestamp ||
            lastMessage.createdAt ||
            conversation.updatedAt ||
            conversation.createdAt;

          let timeLabel = null;
          if (rawTimestamp) {
            const date = new Date(rawTimestamp);
            if (!Number.isNaN(date.getTime())) {
              timeLabel = formatDistanceToNow(date, { addSuffix: true });
            }
          }

          return (
            <li key={conversation._id}>
              <Link
                href={`/dashboard/messages/${conversation._id}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg p-0.5 transition-colors flex-nowrap",
                  unreadCount
                    ? "bg-accent/10 hover:bg-accent/20"
                    : "hover:bg-muted/60"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 rounded-lg">
                    {otherParticipant?.avatar ? (
                      <AvatarImage
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                      />
                    ) : (
                      <AvatarFallback className="rounded-lg">
                        {otherParticipant?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold truncate font-stretch-125%">
                        {otherParticipant?.name || "Loading..."}
                      </span>
                      {timeLabel && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeLabel}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "max-w-[200px] truncate text-sm md:max-w-xs",
                        unreadCount
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {lastMessageText}
                    </span>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={cn("text-xl font-semibold", Inter_500)}>
          Recent Conversations
        </h3>
        <Link
          href="/dashboard/messages"
          className="text-xs font-medium text-brand-text hover:text-highlight"
        >
          View all
        </Link>
      </div>
      {renderContent()}
    </div>
  );
};

export default RecentChats;
