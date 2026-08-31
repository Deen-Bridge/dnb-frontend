import { isSupported, getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "@/lib/config/firebase.config";

let messagingInstance: Messaging | null = null;
let foregroundListener: (() => void) | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

export const PERMISSION_STATE = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
  DEFAULT: "default",
} as const);

export type PermissionStateValue = typeof PERMISSION_STATE[keyof typeof PERMISSION_STATE];

export async function requestNotificationPermission(): Promise<NotificationPermission | "default"> {
  if (typeof Notification === "undefined") return PERMISSION_STATE.DEFAULT;
  const result = await Notification.requestPermission();
  return result;
}

export async function getFcmToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
    });
    return token || null;
  } catch (err: any) { // TODO(types): FCM error
    console.error("[push] Failed to retrieve FCM token:", err?.message || err);
    return null;
  }
}

export interface ForegroundMessagePayload {
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
  [key: string]: any; // TODO(types): FCM payload properties
}

export async function onForegroundMessage(cb: (payload: ForegroundMessagePayload) => void): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  foregroundListener = onMessage(messaging, cb);
  return () => {
    foregroundListener?.();
    foregroundListener = null;
  };
}

export async function saveFcmToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  return true;
}

export async function removeFcmToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  return true;
}

export interface BroadcastPushPayload {
  title?: string;
  body?: string;
  audience?: string;
}

export interface BuildBroadcastPushPayloadResult {
  push: {
    title?: string;
    body: string;
    audience: string;
    clickUrl: string;
  } | null;
}

export function buildBroadcastPushPayload(
  broadcast: BroadcastPushPayload,
  { alsoPush = false }: { alsoPush?: boolean } = {}
): BuildBroadcastPushPayloadResult {
  if (!alsoPush) return { push: null };
  return {
    push: {
      title: broadcast.title,
      body: broadcast.body || broadcast.title || "",
      audience: broadcast.audience || "all",
      clickUrl: "/",
    },
  };
}
