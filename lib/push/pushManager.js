import { config } from "@/lib/config/env";

/**
 * Browser-side Web Push helpers (issue #197).
 *
 * These wrap the native Service Worker Push API so the rest of the app never
 * has to touch low-level `PushManager` details. Everything here is guarded so
 * it is safe to import in SSR / unsupported browsers — the functions simply
 * report "not supported" instead of throwing.
 */

/** True when the current browser can register push subscriptions. */
export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Current Notification permission ("default" | "granted" | "denied"). */
export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Convert a base64 URL-safe VAPID key into the Uint8Array the Push API expects.
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Wait for the active service worker registration (serwist registers it). */
async function getRegistration() {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.ready;
}

/** Return the existing push subscription, if any. */
export async function getExistingSubscription() {
  const registration = await getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Ask the user for permission and create a push subscription.
 * Returns the `PushSubscription` (already JSON-serialisable) or throws with a
 * human-readable message the UI can surface.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const vapidKey = config.vapidPublicKey;
  if (!vapidKey) {
    throw new Error(
      "Push notifications are not configured. Please try again later."
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await getRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
}

/**
 * Remove the browser push subscription. Returns the endpoint that was removed
 * (so the caller can tell the backend which one to drop) or null.
 */
export async function unsubscribeFromPush() {
  const subscription = await getExistingSubscription();
  if (!subscription) return null;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
}
