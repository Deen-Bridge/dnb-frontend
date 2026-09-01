import { db } from "@/lib/config/firebase.config";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export async function joinOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  const participants = [userId1, userId2].sort();
  const q = query(
    collection(db, "conversations"),
    where("participants", "==", participants)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  const docRef = await addDoc(collection(db, "conversations"), {
    participants,
    createdAt: new Date(),
  });
  return docRef.id;
}
