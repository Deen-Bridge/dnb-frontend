"use client";
import { useState, useEffect } from "react";
import { listenToPresence } from "@/lib/actions/messages/listen-to-presence";

export function usePresence(userId) {
  const [presence, setPresence] = useState({ online: false, lastSeen: null });

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenToPresence(userId, setPresence);
    return () => unsubscribe();
  }, [userId]);

  return presence;
}