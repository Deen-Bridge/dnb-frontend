import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";

export async function markMessagesAsRead(convoId, userId) {
  const messagesRef = collection(db, `conversations/${convoId}/messages`);
  const snapshot = await getDocs(messagesRef);

  const batch = writeBatch(db);
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (
      data.sender !== userId &&
      (!data.readBy || !data.readBy.includes(userId))
    ) {
      batch.update(doc.ref, {
        readBy: [...(data.readBy || []), userId],
      });
    }
  });

  await batch.commit();
}
