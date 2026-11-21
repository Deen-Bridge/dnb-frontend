import Cookies from "js-cookie";

const USER_DATA_PREFIXES = [
  "dnb:",
  "dnb_",
  "user_",
  "draft:",
  "draft_",
  "analytics",
  "firebaseLocalStorage",
];

function removeMatchingStorage(storage) {
  if (!storage) return 0;
  const keys = Array.from(
    { length: storage.length },
    (_, index) => storage.key(index)
  ).filter(Boolean);
  const matchingKeys = [];
  for (const key of keys) {
    if (key && USER_DATA_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      matchingKeys.push(key);
    }
  }
  matchingKeys.forEach((key) => storage.removeItem(key));
  return matchingKeys.length;
}

/**
 * Remove browser-resident account data after the server confirms deletion.
 * App appearance preferences are retained; account, drafts, analytics,
 * payment, session, and offline data are removed.
 */
export async function clearClientAccountData({ unsubscribePush } = {}) {
  const result = { push: false, storage: 0, caches: 0, serviceWorkers: 0 };

  if (typeof unsubscribePush === "function") {
    try {
      await unsubscribePush();
      result.push = true;
    } catch {
      // Cleanup is best effort; deleting the account must not be blocked by a
      // browser push provider that is offline or already expired.
    }
  }

  if (typeof window === "undefined") return result;

  Cookies.remove("authToken", { path: "/" });
  Cookies.remove("userInfo", { path: "/" });

  try {
    result.storage += removeMatchingStorage(window.localStorage);
    result.storage += removeMatchingStorage(window.sessionStorage);
    window.sessionStorage.clear();
  } catch {
    // Storage can be unavailable in private browsing contexts.
  }

  if ("caches" in window) {
    try {
      const names = await window.caches.keys();
      await Promise.all(names.map((name) => window.caches.delete(name)));
      result.caches = names.length;
    } catch {
      // Cache storage may be blocked by the browser or an embedded context.
    }
  }

  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      result.serviceWorkers = registrations.length;
    } catch {
      // A stale worker must not prevent the account deletion flow completing.
    }
  }

  window.dispatchEvent(new CustomEvent("deenbridge:account-cleaned"));
  return result;
}

export { USER_DATA_PREFIXES };
