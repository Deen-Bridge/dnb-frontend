// Add this function in a suitable file (e.g., lib/actions/messages/typing.js)
import { db } from "@/lib/config/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function setTyping(conversationId, userId, isTyping) {
  const typingRef = doc(db, `conversations/${conversationId}/typing`, userId);
  await setDoc(typingRef, {
    isTyping,
    updatedAt: serverTimestamp(),
  });
}
