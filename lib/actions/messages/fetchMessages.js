import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/config/firebaseConfig";

export function listenToMessages(convoId, onUpdate) {
  const q = query(
    collection(db, `conversations/${convoId}/messages`),
    orderBy("timestamp")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(messages);
  });

  return unsubscribe; // call this to stop listening
}
