"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  requestNotificationPermission,
  getFcmToken,
  onForegroundMessage,
  saveFcmToken,
  removeFcmToken,
  PERMISSION_STATE,
} from "@/lib/actions/push-notifications";

/**
 * usePushNotifications
 * --------------------
 * Manages FCM token lifecycle for the current user: permission requests,
 * token persistence, and foreground message handling.
 *
 * Returns a stable API the UI can bind to without worrying about lifecycle
 * details.
 *
 * @param {{ enabled?: boolean }} options  Set `enabled` to false to
 *   temporarily disable push (e.g. while logged out).
 */
export function usePushNotifications({ enabled = true } = {}) {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [token, setToken] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tokenRef = useRef(null);

  // Retrieve or request the FCM token when enabled.
  const refresh = useCallback(async () => {
    if (!enabled || typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    try {
      if (Notification.permission === "granted") {
        const t = await getFcmToken();
        setToken(t);
        tokenRef.current = t;
        setPermission(Notification.permission);
        if (t) await saveFcmToken(t);
      } else {
        setPermission(Notification.permission);
      }
    } catch (err) {
      console.error("[push] Failed to initialise FCM:", err.message);
    } finally {
      setIsLoaded(true);
    }
  }, [enabled]);

  // On mount / when enabled changes, fetch the current token.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to foreground messages and register the SW once.
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Register the dedicated FCM service worker if not already active.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch((err) => console.warn("[push] SW registration failed:", err));
    }

    const unsub = onForegroundMessage((payload) => {
      // Consumers can extend this or bind to a shared event bus.
      console.debug("[push] Foreground message:", payload);
    });

    return unsub;
  }, [enabled]);

  // Request permission, retrieve token, and persist.
  const request = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === PERMISSION_STATE.GRANTED) {
      const t = await getFcmToken();
      setToken(t);
      tokenRef.current = t;
      if (t) await saveFcmToken(t);
    }

    return result;
  }, []);

  // Unregister token on logout / explicit disable.
  const clear = useCallback(async () => {
    if (tokenRef.current) {
      await removeFcmToken(tokenRef.current);
    }
    setToken(null);
    tokenRef.current = null;
  }, []);

  return {
    /** Current browser notification permission. */
    permission,
    /** Current FCM registration token (null if unavailable). */
    token,
    /** Whether the initial token check has completed. */
    isLoaded,
    /** Whether the browser supports FCM and permission is granted. */
    isSubscribed: permission === PERMISSION_STATE.GRANTED && Boolean(token),
    /** Whether push notifications are usable in this browser. */
    isSupported: permission !== "default" || typeof Notification !== "undefined",
    /** Request permission and register for push. */
    request,
    /** Re-fetch the token (e.g. after re-login). */
    refresh,
    /** Remove the persisted token (e.g. on logout). */
    clear,
    /** Enum: "granted" | "denied" | "default" */
    PERMISSION_STATE,
  };
}

export default usePushNotifications;
