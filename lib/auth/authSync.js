const AUTH_EVENT_KEY = "dnb-auth-event";
const CHANNEL_NAME = "dnb-auth";

export const AUTH_EVENTS = Object.freeze({
  LOGIN: "login",
  LOGOUT: "logout",
  SESSION_REVOKED: "session-revoked",
});

export function broadcastAuthEvent(type, userId = null) {
  if (typeof window === "undefined") return;
  const event = { type, userId, at: Date.now() };
  try {
    window.localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(event));
    window.localStorage.removeItem(AUTH_EVENT_KEY);
  } catch {
    // Private browsing and disabled storage must not break authentication.
  }
  if (typeof window.BroadcastChannel === "function") {
    const channel = new window.BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  }
}

export function listenForAuthEvents(onEvent) {
  if (typeof window === "undefined") return () => {};
  const handle = (event) => {
    const value = event?.data ?? event?.newValue;
    if (!value) return;
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      if (parsed?.type) onEvent(parsed);
    } catch {
      // Ignore malformed events from other applications sharing the origin.
    }
  };
  window.addEventListener("storage", handle);
  const channel = typeof window.BroadcastChannel === "function"
    ? new window.BroadcastChannel(CHANNEL_NAME)
    : null;
  channel?.addEventListener("message", handle);
  return () => {
    window.removeEventListener("storage", handle);
    channel?.removeEventListener("message", handle);
    channel?.close();
  };
}
