"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { setUserOnline } from "@/hooks/onlineChecker";

const HEARTBEAT_INTERVAL = 45000;

export default function PresenceProvider({ children }) {
  const { user } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const markOnline = () => setUserOnline(user._id, true);
    const markOffline = () => setUserOnline(user._id, false);

    markOnline();

    intervalRef.current = setInterval(markOnline, HEARTBEAT_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        markOffline();
      } else {
        markOnline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", markOffline);

    return () => {
      markOffline();
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", markOffline);
    };
  }, [user?._id]);

  return children;
}