"use client";
/**
 * useVerificationStatus
 * ---------------------
 * React hook that owns the educator verification lifecycle on the client.
 *
 * Responsibilities
 * ----------------
 *   1. Fetch the current status from the backend (fetchVerificationStatus).
 *   2. Expose a normalised status object and convenience booleans.
 *   3. Provide snooze/dismiss persistence for the dashboard banner
 *      (client-side only — stored in localStorage, never sent to the backend).
 *   4. Expose a `refresh()` method so SSE event handlers and manual retries
 *      can pull a fresh status without remounting.
 *   5. Provide `resumeStep` — the 1-based wizard step the user should land on
 *      when they click "Complete verification" (deep-link resume).
 *   6. Subscribe to `verification_status_update` SSE events via
 *      useNotificationSSE so state transitions reflect in real time without
 *      a manual reload.
 *
 * Snooze/dismiss contract
 * -----------------------
 *   - Snooze: hide the banner for SNOOZE_DURATION_MS (24 h).
 *     Stored as { snoozedUntil: <epoch-ms> } in localStorage.
 *   - Dismiss: permanently hide the banner for the current status.
 *     Stored as { dismissedForStatus: <status-string> } in localStorage.
 *   - Neither value ever contains biometric or PII data.
 *   - A status change (e.g. rejection) automatically clears both so the
 *     educator sees the updated state.
 *
 * Only used for educators
 * -----------------------
 *   Non-educator users get status "not_started" with loading=false and
 *   isBannerVisible=false immediately.  The hook is safe to mount for any role.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchVerificationStatus,
  VERIFICATION_STATUS,
} from "@/lib/actions/educators/fetchVerificationStatus";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";

// ── Constants ──────────────────────────────────────────────────────────────

const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const LS_KEY = "dnb_verification_banner";

// Statuses that should never show the dashboard banner (nothing to do)
const SILENT_STATUSES = new Set([
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.NOT_STARTED, // "not started" still shows banner for educators
]);

// Statuses that DO show the banner (with different copy)
const BANNER_STATUSES = new Set([
  VERIFICATION_STATUS.NOT_STARTED,
  VERIFICATION_STATUS.INCOMPLETE,
  VERIFICATION_STATUS.PENDING,
  VERIFICATION_STATUS.UNDER_REVIEW,
  VERIFICATION_STATUS.REJECTED,
]);

// ── LocalStorage helpers ────────────────────────────────────────────────────

function readBannerPrefs() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeBannerPrefs(prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {
    // storage full or private browsing — silently ignore
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   status: import("@/lib/actions/educators/fetchVerificationStatus").VerificationStatusValue,
 *   data:   import("@/lib/actions/educators/fetchVerificationStatus").VerificationStatusResult | null,
 *   loading: boolean,
 *   error:  string | null,
 *   resumeStep: number,
 *   isBannerVisible: boolean,
 *   isVerified: boolean,
 *   isRejected: boolean,
 *   isPending: boolean,
 *   isIncomplete: boolean,
 *   snooze: () => void,
 *   dismiss: () => void,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useVerificationStatus() {
  const { user, refreshUser } = useAuth();
  const { onVerificationUpdate } = useNotificationSSE();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Tracks snooze/dismiss re-render without re-reading LS on every render
  const [bannerPrefsVersion, setBannerPrefsVersion] = useState(0);

  const isEducator = user?.role === "educator";
  const mountedRef = useRef(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    // Non-educators get an instant no-op result
    if (!isEducator) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchVerificationStatus();
      if (!mountedRef.current) return;
      setData(result);

      // If the status changed, clear any stale snooze/dismiss so the new
      // state surfaces immediately
      const prefs = readBannerPrefs();
      if (prefs.dismissedForStatus && prefs.dismissedForStatus !== result.status) {
        writeBannerPrefs({});
        setBannerPrefsVersion((v) => v + 1);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message ?? "Unknown error");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isEducator]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  // ── Real-time SSE subscription ────────────────────────────────────────────
  // When the backend emits `verification_status_update` (dnb-backend#92),
  // refresh the status automatically — no manual reload needed.
  useEffect(() => {
    if (!isEducator) return;
    const unsub = onVerificationUpdate(() => {
      refresh().catch(() => {});
    });
    return unsub;
  }, [isEducator, onVerificationUpdate, refresh]);

  // ── Refresh (callable from SSE handlers or manual retry) ─────────────────
  const refresh = useCallback(async () => {
    await load();
    // Also re-pull the user object so any verification flag on the user
    // record (e.g. user.isVerified) reflects the new state immediately
    if (user?._id) {
      await refreshUser(user._id).catch(() => {});
    }
  }, [load, refreshUser, user?._id]);

  // ── Derived values ────────────────────────────────────────────────────────
  const status = data?.status ?? VERIFICATION_STATUS.NOT_STARTED;

  // The step to resume on — if lastCompletedStep > 0, go to lastCompletedStep+1;
  // otherwise start at step 1 (consent).  Capped at totalSteps.
  const resumeStep = useMemo(() => {
    if (!data) return 1;
    const next = (data.lastCompletedStep ?? 0) + 1;
    return Math.min(next, data.totalSteps ?? 3);
  }, [data]);

  // ── Banner visibility ─────────────────────────────────────────────────────
  const isBannerVisible = useMemo(() => {
    // Reference bannerPrefsVersion to subscribe to prefs changes
    void bannerPrefsVersion;

    if (!isEducator) return false;
    if (loading) return false;
    if (!BANNER_STATUSES.has(status)) return false;
    if (status === VERIFICATION_STATUS.VERIFIED) return false;

    const prefs = readBannerPrefs();

    // Dismissed for this status
    if (prefs.dismissedForStatus === status) return false;

    // Snoozed and window not expired
    if (prefs.snoozedUntil && Date.now() < prefs.snoozedUntil) return false;

    return true;
  }, [isEducator, loading, status, bannerPrefsVersion]);

  // ── Banner actions ────────────────────────────────────────────────────────
  const snooze = useCallback(() => {
    writeBannerPrefs({ snoozedUntil: Date.now() + SNOOZE_DURATION_MS });
    setBannerPrefsVersion((v) => v + 1);
  }, []);

  const dismiss = useCallback(() => {
    writeBannerPrefs({ dismissedForStatus: status });
    setBannerPrefsVersion((v) => v + 1);
  }, [status]);

  return {
    status,
    data,
    loading,
    error,
    resumeStep,
    isBannerVisible,
    isVerified: status === VERIFICATION_STATUS.VERIFIED,
    isRejected: status === VERIFICATION_STATUS.REJECTED,
    isPending:
      status === VERIFICATION_STATUS.PENDING ||
      status === VERIFICATION_STATUS.UNDER_REVIEW,
    isIncomplete:
      status === VERIFICATION_STATUS.INCOMPLETE ||
      status === VERIFICATION_STATUS.NOT_STARTED,
    snooze,
    dismiss,
    refresh,
  };
}
