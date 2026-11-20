import { query, where, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";

export interface ConversationMessage {
  _id: string;
  [key: string]: any; // TODO(types): Firestore message data document
}

export interface UserConversation {
  _id: string;
  messages: ConversationMessage[];
  [key: string]: any; // TODO(types): Firestore conversation document
}

export async function fetchUserConversations(userId: string): Promise<UserConversation[]> {
  if (!userId) throw new Error("userId is required");

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  const snapshot = await getDocs(q);

  const conversations = await Promise.all(
    snapshot.docs.map(async (doc: any) => { // TODO(types): Firestore query document snapshot
      const data = doc.data();
      const convoId = doc.id;

      const messagesSnap = await getDocs(
        collection(db, `conversations/${convoId}/messages`)
      );

      const messages: ConversationMessage[] = messagesSnap.docs.map((msgDoc: any) => ({ // TODO(types): Firestore message document snapshot
        _id: msgDoc.id,
        ...msgDoc.data(),
      }));

      return {
        _id: convoId,
        ...data,
        messages,
      };
    })
  );

  return conversations;
}
