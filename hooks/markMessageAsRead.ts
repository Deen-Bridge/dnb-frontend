import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/config/firebase.config";

export async function markMessagesAsRead(convoId: string, userId: string): Promise<void> {
  const messagesRef = collection(db, `conversations/${convoId}/messages`);
  const snapshot = await getDocs(messagesRef);

  const batch = writeBatch(db);
  snapshot.forEach((doc: any) => { // TODO(types): Firestore message document snapshot
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
