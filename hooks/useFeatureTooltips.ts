"use client";

import { useCallback, useEffect, useState, useMemo } from "react";

export const STORAGE_KEY = "dnb_feature_tooltips_dismissed";
export const MAX_ACTIVE_TOOLTIPS = 3;

export interface FeatureHighlight {
  id: string;
  selector: string;
  message: string;
  title?: string | null;
  placement?: "top" | "bottom" | "left" | "right" | string;
  priority?: number;
  featureVersion?: string;
  [key: string]: any; // TODO(types): Feature highlight properties
}

function loadDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

function elementExists(selector: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    return document.querySelector(selector) !== null;
  } catch {
    return false;
  }
}

export interface UseFeatureTooltipsResult {
  activeTooltips: FeatureHighlight[];
  eligibleCount: number;
  dismissedCount: number;
  isInitialized: boolean;
  dismissTooltip: (id: string) => void;
  dismissAll: () => void;
  resetTooltip: (id: string) => void;
  resetAll: () => void;
  isDismissed: (id: string) => boolean;
  getAnchorElement: (selector: string) => Element | null;
}

export default function useFeatureTooltips(highlights: FeatureHighlight[] = []): UseFeatureTooltipsResult {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => loadDismissedIds());
  const [activeTooltips, setActiveTooltips] = useState<FeatureHighlight[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    setDismissedIds(loadDismissedIds());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveDismissedIds(dismissedIds);
    }
  }, [dismissedIds, isInitialized]);

  const eligibleTooltips = useMemo(() => {
    if (!isInitialized) return [];

    return highlights
      .filter((highlight) => {
        if (dismissedIds.has(highlight.id)) return false;
        if (!elementExists(highlight.selector)) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, MAX_ACTIVE_TOOLTIPS);
  }, [highlights, dismissedIds, isInitialized]);

  useEffect(() => {
    setActiveTooltips(eligibleTooltips);
  }, [eligibleTooltips]);

  const dismissTooltip = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setActiveTooltips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    const activeIds = activeTooltips.map((t) => t.id);
    setDismissedIds((prev) => {
      const next = new Set(prev);
      activeIds.forEach((id) => next.add(id));
      return next;
    });
    setActiveTooltips([]);
  }, [activeTooltips]);

  const resetTooltip = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setDismissedIds(new Set());
  }, []);

  const isDismissed = useCallback(
    (id: string) => dismissedIds.has(id),
    [dismissedIds]
  );

  const getAnchorElement = useCallback((selector: string): Element | null => {
    if (typeof document === "undefined") return null;
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }, []);

  return {
    activeTooltips,
    eligibleCount: eligibleTooltips.length,
    dismissedCount: dismissedIds.size,
    isInitialized,
    dismissTooltip,
    dismissAll,
    resetTooltip,
    resetAll,
    isDismissed,
    getAnchorElement,
  };
}
