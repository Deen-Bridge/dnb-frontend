/**
 * Firebase Cloud Messaging (FCM) push notification utilities.
 * ---------------------------------------------------------------------------
 * Lightweight client-side helpers for requesting permission, retrieving the
 * FCM registration token, and persisting it to the backend.  All functions
 * are safe to call in the browser — they no-op on the server.
 */

import { isSupported } from "firebase/messaging";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "@/lib/config/firebase.config";

let messagingInstance = null;
let foregroundListener = null;

/**
 * Returns the FCM Messaging instance (or null if the browser doesn't support
 * FCM or we're on the server).
 */
async function getMessagingInstance() {
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

/**
 * Permission status values returned by the hook/UI.
 * @readonly
 */
export const PERMISSION_STATE = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
  DEFAULT: "default",
});

/**
 * Request notification permission from the user.
 *
 * @returns {Promise<"granted"|"denied"|"default">}
 */
export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return PERMISSION_STATE.DEFAULT;
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Retrieve the current FCM registration token.  Returns `null` when
 * notifications are not supported or permission has not been granted.
 *
 * @returns {Promise<string|null>}
 */
export async function getFcmToken() {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
    });
    return token || null;
  } catch (err) {
    console.error("[push] Failed to retrieve FCM token:", err.message);
    return null;
  }
}

/**
 * Subscribe to foreground messages (app in focus).  Returns an unsubscribe
 * function.  Useful for showing in-app toasts when a push arrives.
 *
 * @param {(payload: { notification?: { title?: string, body?: string }, data?: Record<string, string> }) => void} cb
 * @returns {() => void}
 */
export async function onForegroundMessage(cb) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  foregroundListener = onMessage(messaging, cb);
  return () => {
    foregroundListener?.();
    foregroundListener = null;
  };
}

/**
 * Persist an FCM token to the backend so it can be targeted by pushes.
 *
 * TODO(backend): POST /api/user/push-tokens
 *   - Auth: authenticated session.
 *   - Body: { token: string, platform: "web" }
 *   - 200 → { success: true }
 *
 * @param {string} token
 * @returns {Promise<boolean>} true on success
 */
export async function saveFcmToken(token) {
  if (!token) return false;
  // Stubbed: the backend endpoint is not implemented yet.
  // When available, replace with:
  //   await axiosInstance.post("/api/user/push-tokens", { token, platform: "web" });
  return true;
}

/**
 * Remove an FCM token from the backend (e.g. on logout).
 *
 * TODO(backend): DELETE /api/user/push-tokens
 *   - Auth: authenticated session.
 *   - Body: { token: string }
 *   - 200 → { success: true }
 *
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function removeFcmToken(token) {
  if (!token) return false;
  // Stubbed: see saveFcmToken.
  return true;
}

/**
 * Build the push payload shape expected by the backend when sending a
 * broadcast via FCM.
 *
 * @param {{ title: string, body?: string, audience?: string }} broadcast
 * @param {{ alsoPush?: boolean }} options
 * @returns {{ push?: { title: string, body: string, audience: string, clickUrl: string } }}
 */
export function buildBroadcastPushPayload(broadcast, { alsoPush = false } = {}) {
  if (!alsoPush) return { push: null };
  return {
    push: {
      title: broadcast.title,
      body: broadcast.body || broadcast.title,
      audience: broadcast.audience || "all",
      clickUrl: "/",
    },
  };
}
