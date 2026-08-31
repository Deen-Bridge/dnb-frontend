"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

const STORAGE_KEY = "dnb-media-blur";

function detectReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface StoredBlurState {
  blurEnabled?: boolean;
}

function loadFromStorage(): StoredBlurState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(value: StoredBlurState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export interface UseMediaBlurOptions {
  overrideDefault?: boolean;
}

export interface UseMediaBlurReturn {
  blurEnabled: boolean;
  toggleBlur: () => void;
  setBlur: (enabled: boolean) => void;
  reducedMotion: boolean;
  loaded: boolean;
}

export default function useMediaBlur({
  overrideDefault = false,
}: UseMediaBlurOptions = {}): UseMediaBlurReturn {
  const [blurEnabled, setBlurEnabled] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const prefersReduced = detectReducedMotion();
    setReducedMotion(prefersReduced);

    const stored = loadFromStorage();

    if (prefersReduced) {
      setBlurEnabled(false);
    } else if (stored !== null) {
      setBlurEnabled(!!stored.blurEnabled);
    } else {
      setBlurEnabled(overrideDefault);
    }

    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setBlurEnabled(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage({ blurEnabled });
  }, [blurEnabled, loaded]);

  const toggleBlur = useCallback(() => {
    if (reducedMotion) return;
    setBlurEnabled((prev) => !prev);
  }, [reducedMotion]);

  const setBlur = useCallback(
    (v: boolean) => {
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
