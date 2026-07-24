import { db } from "@/lib/config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

export function listenToPresence(userId, callback) {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        online: data.online ?? false,
        lastSeen: data.lastSeen ?? null,
      });
    } else {
      callback({ online: false, lastSeen: null });
    }
  });
}