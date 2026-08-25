"use client";
/**
 * EmergencyBroadcastBanner — learner-facing red alert banner (#307).
 * ---------------------------------------------------------------------------
 * The learner-side surface of the emergency-broadcast quick-action. Mounted
 * once in `AppProviders` so every visitor — logged-in learner, educator, or
 * logged-out guest — sees an active incident alert app-wide, mirroring how
 * `MaintenanceGate` is mounted.
 *
 * It reads the **public** active broadcast itself (like the maintenance gate
 * reads its public flag) and polls lightly + refetches on window focus so a
 * send propagates to already-open tabs without a manual reload. It renders
 * NOTHING when there is no active broadcast or when the visitor has dismissed
 * the current one, so it never crashes or intrudes for logged-out / non-admin
 * users.
 *
 * Distinct RED (destructive) treatment marks this as high-severity, visually
 * separating it from the amber maintenance bar.
 */
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import {
  getActiveEmergencyBroadcast,
  labelForAreas,
} from "@/lib/actions/admin-emergency-broadcast";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Poll cadence for propagating a send to already-open tabs. */
const POLL_INTERVAL_MS = 60_000;

/** Format an ISO ETA into a short, human "resolved by" label. */
function formatEta(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EmergencyBroadcastBanner() {
  const [broadcast, setBroadcast] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  const fetchActive = useCallback(async () => {
    try {
      const { broadcast: active } = await getActiveEmergencyBroadcast();
      setBroadcast(active);
    } catch {
      // Fail silent: on a read error leave the last-known state so a transient
      // hiccup never wrongly hides or shows the alert.
    }
  }, []);

  useEffect(() => {
    fetchActive();
    const id = setInterval(fetchActive, POLL_INTERVAL_MS);
    const onFocus = () => fetchActive();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchActive]);

  // Nothing active, or the visitor already dismissed this exact alert.
  if (!broadcast || broadcast.id === dismissedId) return null;

  const etaLabel = formatEta(broadcast.etaAt);
  const areas = labelForAreas(broadcast.affectedAreas);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        poppins_400.className,
        "relative z-[70] border-b border-red-800/40 bg-red-600 text-red-50 shadow-md"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-100"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn(poppins_600.className, "text-sm leading-snug")}>
            {broadcast.title}
          </p>
          {broadcast.body ? (
            <p className="text-xs leading-snug text-red-100/90">
              {broadcast.body}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
            {etaLabel ? (
              <span
                className={cn(
                  poppins_500.className,
                  "inline-flex items-center gap-1 text-xs text-red-100"
                )}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Est. resolved by {etaLabel}
              </span>
            ) : null}
            {areas.length > 0 ? (
              <span className="flex flex-wrap items-center gap-1.5">
                {areas.map((area) => (
                  <span
                    key={area}
                    className={cn(
                      poppins_500.className,
                      "rounded-full border border-red-100/30 bg-red-700/40 px-2 py-0.5 text-[11px] leading-none"
                    )}
                  >
                    {area}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissedId(broadcast.id)}
          aria-label="Dismiss emergency alert"
          className="shrink-0 rounded-full p-1 text-red-100 transition hover:bg-red-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
