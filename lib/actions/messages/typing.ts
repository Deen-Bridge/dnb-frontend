import { db } from "@/lib/config/firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
  const typingRef = doc(db, `conversations/${conversationId}/typing`, userId);
  await setDoc(typingRef, {
    isTyping,
    updatedAt: serverTimestamp(),
  });
}
