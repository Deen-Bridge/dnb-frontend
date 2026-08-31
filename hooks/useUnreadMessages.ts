import { useEffect, useRef, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";
import { useAuth } from "@/hooks/useAuth";

export type Unsubscribe = () => void;

export function useUnreadMessages(): Record<string, number> {
  const { user } = useAuth();
  const [unread, setUnread] = useState<Record<string, number>>({});
  const messageListenersRef = useRef<Record<string, Unsubscribe>>({});

  useEffect(() => {
    if (!user?._id) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user._id)
    );

    const unsubscribeConversations = onSnapshot(q, (snapshot: any) => { // TODO(types): Firestore query snapshot
      const activeConversationIds = new Set<string>();

      snapshot.docs.forEach((doc: any) => { // TODO(types): Firestore document snapshot
        const convoId = doc.id;
        activeConversationIds.add(convoId);

        if (!messageListenersRef.current[convoId]) {
          const messagesRef = collection(
            db,
            `conversations/${convoId}/messages`
          );

          const unsubscribeMessages = onSnapshot(messagesRef, (messagesSnap: any) => { // TODO(types): Firestore messages query snapshot
            let count = 0;
            messagesSnap.forEach((messageDoc: any) => { // TODO(types): Firestore message document snapshot
              const data = messageDoc.data();
              const senderId = data.senderId || data.sender;
              const readBy = data.readBy || [];

              const isNotOwnMessage = senderId && senderId !== user._id;
              const isUnread = isNotOwnMessage && !readBy.includes(user._id);

              if (isUnread) {
                count += 1;
              }
            });

            setUnread((prev) => {
              const next = { ...prev };
              if (count > 0) {
                next[convoId] = count;
              } else {
                delete next[convoId];
              }
              return next;
            });
          });

          messageListenersRef.current[convoId] = unsubscribeMessages;
        }
      });

      Object.keys(messageListenersRef.current).forEach((convoId) => {
        if (!activeConversationIds.has(convoId)) {
          messageListenersRef.current[convoId]?.();
          delete messageListenersRef.current[convoId];
          setUnread((prev) => {
            const next = { ...prev };
            delete next[convoId];
            return next;
          });
        }
      });
    });

    return () => {
      unsubscribeConversations();
      Object.values(messageListenersRef.current).forEach((unsubscribe) => {
        unsubscribe?.();
      });
      messageListenersRef.current = {};
      setUnread({});
    };
  }, [user?._id]);

  return unread;
}
