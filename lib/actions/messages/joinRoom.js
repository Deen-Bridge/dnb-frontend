import { db } from "@/lib/config/firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export async function joinOrCreateConversation(userId1, userId2) {
  // Always store participants sorted to avoid duplicate rooms
  const participants = [userId1, userId2].sort();
  const q = query(
    collection(db, "conversations"),
    where("participants", "==", participants)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    // Conversation exists
    return snapshot.docs[0].id;
  }
  // Create new conversation
  const docRef = await addDoc(collection(db, "conversations"), {
    participants,
    createdAt: new Date(),
  });
  return docRef.id;
}
