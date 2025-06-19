import { db } from "@/lib/config/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function setUserOnline(userId, isOnline) {
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
