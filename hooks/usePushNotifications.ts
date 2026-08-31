"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  requestNotificationPermission,
  getFcmToken,
  onForegroundMessage,
  saveFcmToken,
  removeFcmToken,
  PERMISSION_STATE,
  PermissionStateValue,
} from "@/lib/actions/push-notifications";

export interface UsePushNotificationsOptions {
  enabled?: boolean;
}

export interface UsePushNotificationsResult {
  permission: NotificationPermission | "default";
  token: string | null;
  isLoaded: boolean;
  isSubscribed: boolean;
  isSupported: boolean;
  request: () => Promise<NotificationPermission | "default">;
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
  PERMISSION_STATE: typeof PERMISSION_STATE;
}

export function usePushNotifications({ enabled = true }: UsePushNotificationsOptions = {}): UsePushNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission | "default">(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const tokenRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const t = await getFcmToken();
        setToken(t);
        tokenRef.current = t;
        setPermission(Notification.permission);
        if (t) await saveFcmToken(t);
      } else if (typeof Notification !== "undefined") {
        setPermission(Notification.permission);
      }
    } catch (err: any) { // TODO(types): FCM initialization error
      console.error("[push] Failed to initialise FCM:", err?.message || err);
    } finally {
      setIsLoaded(true);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch((err) => console.warn("[push] SW registration failed:", err));
    }

    let cleanup: (() => void) | undefined;
    onForegroundMessage((payload) => {
      console.debug("[push] Foreground message:", payload);
    }).then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      cleanup?.();
    };
  }, [enabled]);

  const request = useCallback(async (): Promise<NotificationPermission | "default"> => {
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

  const clear = useCallback(async (): Promise<void> => {
    if (tokenRef.current) {
      await removeFcmToken(tokenRef.current);
    }
    setToken(null);
    tokenRef.current = null;
  }, []);

  return {
    permission,
    token,
    isLoaded,
    isSubscribed: permission === PERMISSION_STATE.GRANTED && Boolean(token),
    isSupported: permission !== "default" || typeof Notification !== "undefined",
    request,
    refresh,
    clear,
    PERMISSION_STATE,
  };
}

export default usePushNotifications;
