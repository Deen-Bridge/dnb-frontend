import { query, where, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/config/firebaseConfig";

export async function fetchUserConversations(userId) {
  if (!userId) throw new Error("userId is required");
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    _id: doc.id,
    ...doc.data(),
  }));
}
