import { db } from "@/lib/config/firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function setUserOnline(userId: string, isOnline: boolean): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      online: isOnline,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}
