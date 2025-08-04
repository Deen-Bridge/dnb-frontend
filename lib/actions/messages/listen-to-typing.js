import { db } from "@/lib/config/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

export function listenToTyping(conversationId, callback) {
  const typingCol = collection(db, `conversations/${conversationId}/typing`);
  return onSnapshot(typingCol, (snapshot) => {
    const typingUsers = {};
    snapshot.forEach((doc) => {
      typingUsers[doc.id] = doc.data().isTyping;
    });
    callback(typingUsers);
  });
}
