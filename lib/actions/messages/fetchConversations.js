import { query, where, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/config/firebaseConfig";

export async function fetchUserConversations(userId) {
  if (!userId) throw new Error("userId is required");

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  const snapshot = await getDocs(q);

  const conversations = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const convoId = doc.id;

      // Fetch messages from subcollection
      const messagesSnap = await getDocs(
        collection(db, `conversations/${convoId}/messages`)
      );

      const messages = messagesSnap.docs.map((msgDoc) => ({
        _id: msgDoc.id,
        ...msgDoc.data(),
      }));

      return {
        _id: convoId,
        ...data,
        messages, // attach messages here
      };
    })
  );

  return conversations;
}
