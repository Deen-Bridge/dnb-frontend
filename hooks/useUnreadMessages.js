import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";
import { useAuth } from "@/hooks/useAuth";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unread, setUnread] = useState({}); // { conversationId: count }

  useEffect(() => {
    if (!user?._id) return;

    // Listen to conversations in real-time
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user._id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const unreadCounts = {};

      // Process each conversation
      for (const doc of snapshot.docs) {
        const convoId = doc.id;

        try {
          // Fetch messages for this conversation
          const messagesSnap = await getDocs(
            collection(db, `conversations/${convoId}/messages`)
          );

          const messages = messagesSnap.docs.map((msgDoc) => ({
            _id: msgDoc.id,
            ...msgDoc.data(),
          }));

          // Count unread messages - check both senderId and sender fields
          const unreadMsgs = messages.filter((msg) => {
            const isNotOwnMessage =
              msg.senderId !== user._id && msg.sender !== user._id;
            const isUnread = !msg.readBy || !msg.readBy.includes(user._id);

            // Debug logging for first few messages
            if (messages.indexOf(msg) < 3) {
              console.log("Message debug:", {
                id: msg._id,
                senderId: msg.senderId,
                sender: msg.sender,
                readBy: msg.readBy,
                isNotOwnMessage,
                isUnread,
                userId: user._id,
              });
            }

            return isNotOwnMessage && isUnread;
          });

          if (unreadMsgs.length > 0) {
            unreadCounts[convoId] = unreadMsgs.length;
          }
        } catch (error) {
          console.error(
            `Error fetching messages for conversation ${convoId}:`,
            error
          );
        }
      }

      setUnread(unreadCounts);
    });

    return () => unsubscribe();
  }, [user?._id]);

  return unread; // { conversationId: count }
}
