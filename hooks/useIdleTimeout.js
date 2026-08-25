"use client";
/**
 * useIdleTimeout — reusable inactivity timer for session hardening (#337).
 * ---------------------------------------------------------------------------
 * Tracks user activity (mousemove / keydown / click / scroll / touch /
 * visibility) and fires two callbacks:
 *   - `onWarn`    after `idleMs - warnMs` of inactivity (show a warning), and
 *   - `onTimeout` at `idleMs` of inactivity (auto-logout).
 *
 * It exposes `{ isIdleWarning, remainingSeconds, reset, stayActive }` so a UI
 * can render a live countdown and let the user cancel.
 *
 * Robustness
 * ----------
 *   - Activity handlers are throttled so a moving mouse doesn't reset timers on
 *     every pixel.
 *   - All timers/intervals/listeners are cleaned up on unmount, on `enabled`
 *     flipping off, and whenever the timing inputs change.
 *   - Callbacks are held in refs so changing an inline `onWarn`/`onTimeout` does
 *     not tear down and re-arm the listeners.
 *   - Fully guarded for SSR (no `window`) and post-unmount state updates.
 *
 * @param {Object} options
 * @param {number} options.idleMs   total inactivity before timeout (ms)
 * @param {number} options.warnMs   how long before timeout to warn (ms)
 * @param {boolean} [options.enabled=true] arm the timer only when true
 * @param {() => void} [options.onWarn]     fired once when the warning begins
 * @param {() => void} [options.onTimeout]  fired once when the timeout elapses
 * @param {number} [options.throttleMs=750] min gap between activity resets
 * @returns {{isIdleWarning: boolean, remainingSeconds: number, reset: () => void, stayActive: () => void}}
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "wheel",
];

export default function useIdleTimeout({
  idleMs,
  warnMs,
  enabled = true,
  onWarn,
  onTimeout,
  throttleMs = 750,
} = {}) {
  const [isIdleWarning, setIsIdleWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.ceil((warnMs || 0) / 1000)
  );

  // Keep callbacks in refs so their identity doesn't re-arm the effect.
  const onWarnRef = useRef(onWarn);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onWarnRef.current = onWarn;
  }, [onWarn]);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const mountedRef = useRef(false);
  const warnTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    warnTimerRef.current = null;
    idleTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  // `reset` is exposed and also used internally on activity. It re-arms the
  // warn/idle timers from "now". Guarded so it no-ops while disabled.
  const reset = useCallback(() => {
    if (!enabled || !Number.isFinite(idleMs) || idleMs <= 0) return;
    clearTimers();
    if (mountedRef.current) setIsIdleWarning(false);

    const safeWarnMs = Math.min(Math.max(0, warnMs || 0), idleMs);
    const warnAt = Math.max(0, idleMs - safeWarnMs);

    warnTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setIsIdleWarning(true);
      setRemainingSeconds(Math.ceil(safeWarnMs / 1000));
      onWarnRef.current?.();

      // Live countdown for the UI while the warning is showing.
      countdownRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }, warnAt);

    idleTimerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = null;
      if (!mountedRef.current) return;
      setRemainingSeconds(0);
      onTimeoutRef.current?.();
    }, idleMs);
  }, [enabled, idleMs, warnMs, clearTimers]);

  // `stayActive` is the explicit user-driven reset (e.g. "Stay signed in").
  const stayActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    reset();
  }, [reset]);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled || typeof window === "undefined") {
      clearTimers();
      setIsIdleWarning(false);
      return () => {
        mountedRef.current = false;
        clearTimers();
      };
    }

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < throttleMs) return;
      lastActivityRef.current = now;
      reset();
    };

    const handleVisibility = () => {
      // Returning to the tab counts as activity; leaving it does not.
      if (document.visibilityState === "visible") handleActivity();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);

    // Arm immediately.
    lastActivityRef.current = Date.now();
    reset();

    return () => {
      mountedRef.current = false;
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimers();
    };
  }, [enabled, throttleMs, reset, clearTimers]);

  return { isIdleWarning, remainingSeconds, reset, stayActive };
}
