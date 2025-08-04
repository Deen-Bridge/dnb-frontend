import { db } from "@/lib/config/firebase.config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function sendMessage(convoId, senderId, text) {
  const msgRef = collection(db, `conversations/${convoId}/messages`);
  await addDoc(msgRef, {
    text,
    senderId,
    timestamp: serverTimestamp(),
  });

  const convoRef = doc(db, "conversations", convoId);
  await updateDoc(convoRef, {
    lastMessage: {
      text,
      senderId,
      timestamp: serverTimestamp(),
    },
  });
}
