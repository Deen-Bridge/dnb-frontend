import { db } from "@/lib/config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

export type Unsubscribe = () => void;

export interface UserPresence {
  online: boolean;
  lastSeen: any; // TODO(types): Firestore timestamp or ISO string
}

export function listenToPresence(userId: string, callback: (presence: UserPresence) => void): Unsubscribe {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (snapshot: any) => { // TODO(types): Firestore document snapshot
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
