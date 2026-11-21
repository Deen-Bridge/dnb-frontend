export const PRIVATE_CACHE_CLEAR_MESSAGE = "CLEAR_PRIVATE_CACHES";

// Ask the active worker to clear its runtime caches. The local Cache API clear
// in AuthProvider remains the fallback for browsers without an active worker.
export const requestPrivateCacheClear = (reason = "session-change") => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const message = { type: PRIVATE_CACHE_CLEAR_MESSAGE, reason };
  const worker = navigator.serviceWorker.controller;
  if (worker) {
    worker.postMessage(message);
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => registration.active?.postMessage(message))
    .catch(() => {});
};
