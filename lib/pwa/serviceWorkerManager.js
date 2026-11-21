export const SERVICE_WORKER_PATH = "/sw.js";

export function isServiceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function reportServiceWorkerError(phase, error) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dnb:service-worker-error", { detail: { phase, error } })
    );
  }
  console.error(`[service-worker] ${phase}`, error);
}

export async function registerServiceWorker({ onUpdate, onError } = {}) {
  if (!isServiceWorkerSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      updateViaCache: "none",
    });

    const observeInstallingWorker = (worker) => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          onUpdate?.(registration);
        }
        if (worker.state === "redundant") {
          reportServiceWorkerError("install", new Error("Worker became redundant"));
        }
      });
    };

    observeInstallingWorker(registration.installing);
    registration.addEventListener("updatefound", () => {
      observeInstallingWorker(registration.installing);
    });
    if (registration.waiting && navigator.serviceWorker.controller) {
      onUpdate?.(registration);
    }
    return registration;
  } catch (error) {
    reportServiceWorkerError("register", error);
    onError?.(error);
    return null;
  }
}

export function activateWaitingServiceWorker(registration) {
  if (!registration?.waiting) return false;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  return true;
}

export async function unregisterServiceWorker() {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const ownRegistrations = registrations.filter((registration) =>
      registration.active?.scriptURL.endsWith(SERVICE_WORKER_PATH)
    );
    const results = await Promise.all(
      ownRegistrations.map((registration) => registration.unregister())
    );
    return results.every(Boolean);
  } catch (error) {
    reportServiceWorkerError("unregister", error);
    return false;
  }
}
