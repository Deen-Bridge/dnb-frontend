"use client";

import { useEffect, useRef, useState } from "react";
import {
  activateWaitingServiceWorker,
  registerServiceWorker,
} from "@/lib/pwa/serviceWorkerManager";

export default function ServiceWorkerProvider({ children }) {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const reloadAfterControllerChange = useRef(false);

  useEffect(() => {
    let active = true;
    registerServiceWorker({
      onUpdate: (nextRegistration) => {
        if (active) {
          setRegistration(nextRegistration);
          setUpdateAvailable(true);
        }
      },
    }).then((nextRegistration) => {
      if (active) setRegistration(nextRegistration);
    });

    const handleControllerChange = () => {
      if (reloadAfterControllerChange.current) window.location.reload();
    };
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      active = false;
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    if (!activateWaitingServiceWorker(registration)) return;
    reloadAfterControllerChange.current = true;
    setUpdating(true);
  };

  return (
    <>
      {children}
      {updateAvailable && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-[100] flex items-center justify-between gap-4 rounded-xl border border-accent/20 bg-surface-raised p-4 shadow-lg md:inset-x-auto md:end-4 md:w-[min(28rem,calc(100vw-2rem))]">
          <p className="text-sm text-ink">A new version of Deen Bridge is ready. Reload to update safely.</p>
          <button type="button" className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60" onClick={applyUpdate} disabled={updating}>
            {updating ? "Updating…" : "Reload"}
          </button>
        </div>
      )}
    </>
  );
}
