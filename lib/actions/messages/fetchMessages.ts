import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";

export type Unsubscribe = () => void;

export function listenToMessages(convoId: string, onUpdate: (messages: any[]) => void): Unsubscribe { // TODO(types): Messages array payload
  const q = query(
    collection(db, `conversations/${convoId}/messages`),
    orderBy("timestamp")
  );

  const unsubscribe = onSnapshot(q, (snapshot: any) => { // TODO(types): Firestore query snapshot
    const messages = snapshot.docs.map((doc: any) => ({ // TODO(types): Firestore document snapshot
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(messages);
  });

  return unsubscribe;
}
