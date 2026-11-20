import { db } from "@/lib/config/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

export type Unsubscribe = () => void;

export function listenToTyping(
  conversationId: string,
  callback: (typingUsers: Record<string, boolean>) => void
): Unsubscribe {
  const typingCol = collection(db, `conversations/${conversationId}/typing`);
  return onSnapshot(typingCol, (snapshot: any) => { // TODO(types): Firestore query snapshot
    const typingUsers: Record<string, boolean> = {};
    snapshot.forEach((doc: any) => { // TODO(types): Firestore document snapshot
      typingUsers[doc.id] = doc.data().isTyping;
    });
    callback(typingUsers);
  });
}
