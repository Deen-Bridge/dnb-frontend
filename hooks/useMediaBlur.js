"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

const STORAGE_KEY = "dnb-media-blur";

/**
 * Detect prefers-reduced-motion via the CSS media query.
 * Returns `false` outside the browser (SSR safe).
 */
function detectReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

/**
 * Global media-blur gate for sensitive-content review (#268).
 *
 * Reads the admin's stored preference from `localStorage` (key
 * `dnb-media-blur`). When `prefers-reduced-motion` is active the
 * blur is **always disabled** regardless of stored preference.
 *
 * @param {object}  [options]
 * @param {boolean} [options.overrideDefault=false] – When a stored
 *   preference does not yet exist this value determines the initial
 *   state. For example, the flagged-only queue view passes `true` so
 *   blur is ON by default there.
 *
 * @returns {{
 *   blurEnabled: boolean,
 *   toggleBlur: () => void,
 *   setBlur: (enabled: boolean) => void,
 *   reducedMotion: boolean,
 *   loaded: boolean,
 * }}
 */
export default function useMediaBlur({ overrideDefault = false } = {}) {
  const [blurEnabled, setBlurEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Initialise on mount ────────────────────────────────────────────
  useEffect(() => {
    const prefersReduced = detectReducedMotion();
    setReducedMotion(prefersReduced);

    const stored = loadFromStorage();

    if (prefersReduced) {
      // User has opted out of motion-heavy UI — honour that.
      setBlurEnabled(false);
    } else if (stored !== null) {
      setBlurEnabled(!!stored.blurEnabled);
    } else {
      setBlurEnabled(overrideDefault);
    }

    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for runtime changes to prefers-reduced-motion ───────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => {
      setReducedMotion(e.matches);
      if (e.matches) setBlurEnabled(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // ── Persist to localStorage whenever blur state changes ─────────────
  useEffect(() => {
    if (!loaded) return;
    saveToStorage({ blurEnabled });
  }, [blurEnabled, loaded]);

  const toggleBlur = useCallback(() => {
    if (reducedMotion) return;
    setBlurEnabled((prev) => !prev);
  }, [reducedMotion]);

  const setBlur = useCallback(
    (v) => {
      if (reducedMotion) return;
      setBlurEnabled(!!v);
    },
    [reducedMotion],
  );

  return useMemo(
    () => ({ blurEnabled, toggleBlur, setBlur, reducedMotion, loaded }),
    [blurEnabled, toggleBlur, setBlur, reducedMotion, loaded],
  );
}
