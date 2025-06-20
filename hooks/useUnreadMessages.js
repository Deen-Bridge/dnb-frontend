import { useEffect, useState } from "react";
import { fetchUserConversations } from "@/lib/actions/messages/fetchConversations";
import { useAuth } from "@/hooks/useAuth";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unread, setUnread] = useState({}); // { conversationId: count }

  useEffect(() => {
    if (!user?._id) return;
    fetchUserConversations(user._id).then((convos) => {
      const unreadCounts = {};
      convos.forEach((convo) => {
        // If you store messages in convo.messages, otherwise adjust as needed
        const unreadMsgs = (convo.messages || []).filter(
          (msg) => !msg.readBy?.includes(user._id) && msg.sender !== user._id
        );
        if (unreadMsgs.length > 0) unreadCounts[convo._id] = unreadMsgs.length;
      });
      setUnread(unreadCounts);
    });
  }, [user?._id]);

  return unread; // { conversationId: count }
}
