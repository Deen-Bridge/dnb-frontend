"use client";
import { useState, useEffect } from "react";
import { listenToPresence } from "@/lib/actions/messages/listen-to-presence";

export interface UserPresenceState {
  online: boolean;
  lastSeen: any; // TODO(types): Firestore Timestamp / Date
}

export function usePresence(userId?: string | null): UserPresenceState {
  const [presence, setPresence] = useState<UserPresenceState>({ online: false, lastSeen: null });

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenToPresence(userId, setPresence);
    return () => unsubscribe();
  }, [userId]);

  return presence;
}
