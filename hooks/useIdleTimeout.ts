"use client";

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

export interface UseIdleTimeoutOptions {
  idleMs: number;
  warnMs: number;
  enabled?: boolean;
  onWarn?: () => void;
  onTimeout?: () => void;
  throttleMs?: number;
}

export interface UseIdleTimeoutResult {
  isIdleWarning: boolean;
  remainingSeconds: number;
  reset: () => void;
  stayActive: () => void;
}

export default function useIdleTimeout({
  idleMs,
  warnMs,
  enabled = true,
  onWarn,
  onTimeout,
  throttleMs = 750,
}: UseIdleTimeoutOptions): UseIdleTimeoutResult {
  const [isIdleWarning, setIsIdleWarning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    Math.ceil((warnMs || 0) / 1000)
  );

  const onWarnRef = useRef<(() => void) | undefined>(onWarn);
  const onTimeoutRef = useRef<(() => void) | undefined>(onTimeout);
  useEffect(() => {
    onWarnRef.current = onWarn;
  }, [onWarn]);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const mountedRef = useRef<boolean>(false);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    warnTimerRef.current = null;
    idleTimerRef.current = null;
    countdownRef.current = null;
  }, []);

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
      if (document.visibilityState === "visible") handleActivity();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);

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
