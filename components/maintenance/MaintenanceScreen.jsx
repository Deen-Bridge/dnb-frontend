"use client";
/**
 * MaintenanceScreen — the friendly learner-facing lock screen (#303).
 * ---------------------------------------------------------------------------
 * Shown by `MaintenanceGate` to non-admin / logged-out visitors while
 * platform-wide maintenance mode is ON. Built by ADAPTING the offline page's
 * visual shell (`LockScreenShell`) so it shares the exact gradient + icon-card
 * styling rather than duplicating it.
 *
 * Purely presentational: it renders a reassuring heading, the admin's optional
 * custom message, and — when an `etaAt` is provided — a LIVE COUNTDOWN
 * ("Back in ~1h 12m") that ticks every second and degrades gracefully once the
 * ETA has passed.
 */
import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import LockScreenShell from "@/components/maintenance/LockScreenShell";

const DEFAULT_MESSAGE =
  "Deen Bridge is briefly down for scheduled maintenance. We're polishing things up and will be back shortly — thank you for your patience.";

/**
 * Format the milliseconds remaining until the ETA into a friendly, approximate
 * label. Returns `null` when there is no valid future target so the caller can
 * omit the countdown entirely.
 *
 * @param {number} msRemaining
 * @returns {string}
 */
function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "Back any moment now";
  const totalMinutes = Math.floor(msRemaining / 60000);
  if (totalMinutes < 1) return "Back in less than a minute";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `Back in ~${days}d${remHours ? ` ${remHours}h` : ""}`;
  }
  if (hours >= 1) return `Back in ~${hours}h ${minutes}m`;
  return `Back in ~${minutes}m`;
}

/**
 * Live countdown pill. Recomputes every second off the wall clock so it stays
 * accurate across tab sleeps, and stops updating once the ETA is reached.
 *
 * @param {{etaAt: string}} props ISO 8601 target timestamp.
 */
function Countdown({ etaAt }) {
  const target = new Date(etaAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  const label = formatCountdown(target - now);

  return (
    <div
      className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-2 w-2 animate-pulse rounded-full bg-accent"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

/**
 * @param {object} props
 * @param {string|null} [props.message] Optional custom admin message.
 * @param {string|null} [props.etaAt]   Optional ISO 8601 "back online" target.
 */
export default function MaintenanceScreen({ message, etaAt }) {
  return (
    <LockScreenShell
      icon={<Wrench className="h-10 w-10 text-accent" aria-hidden="true" />}
      title={<>We&apos;ll be right back</>}
      description={message?.trim() ? message : DEFAULT_MESSAGE}
      footer="This page will not update automatically — please check back in a little while."
    >
      {etaAt ? <Countdown etaAt={etaAt} /> : null}
    </LockScreenShell>
  );
}
