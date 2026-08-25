"use client";
/**
 * useFeatureTooltips — hook for feature announcement tooltips (#304)
 * -------------------------------------------------------------------
 * Manages the display of feature announcement tooltips ("what's new").
 * Tracks which tooltips have been dismissed per user via localStorage
 * and limits active tooltips to prevent overwhelming the user.
 *
 * Features:
 * - First-visit detection per feature per user
 * - Maximum 3 active tooltips at once
 * - Persistent dismissal state
 * - Graceful degradation when anchor elements are missing
 */

import { useCallback, useEffect, useState, useMemo } from "react";

const STORAGE_KEY = "dnb_feature_tooltips_dismissed";
const MAX_ACTIVE_TOOLTIPS = 3;

/**
 * @typedef {Object} FeatureHighlight
 * @property {string} id - Unique identifier
 * @property {string} selector - CSS selector for anchor element
 * @property {string} message - Tooltip message content
 * @property {string} [title] - Optional title
 * @property {'top' | 'bottom' | 'left' | 'right'} [placement] - Tooltip placement
 * @property {number} [priority] - Higher priority shown first (default: 0)
 * @property {string} [featureVersion] - Version identifier for re-showing on updates
 */

/**
 * Load dismissed tooltip IDs from localStorage
 * @returns {Set<string>}
 */
function loadDismissedIds() {
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

/**
 * Save dismissed tooltip IDs to localStorage
 * @param {Set<string>} ids
 */
function saveDismissedIds(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage quota exceeded or unavailable - fail silently
  }
}

/**
 * Check if an element exists in the DOM
 * @param {string} selector
 * @returns {boolean}
 */
function elementExists(selector) {
  if (typeof document === "undefined") return false;
  try {
    return document.querySelector(selector) !== null;
  } catch {
    // Invalid selector - fail silently
    return false;
  }
}

/**
 * Hook for managing feature announcement tooltips
 * @param {FeatureHighlight[]} highlights - Array of feature highlights to potentially show
 * @returns {Object} Tooltip management interface
 */
export default function useFeatureTooltips(highlights = []) {
  const [dismissedIds, setDismissedIds] = useState(() => loadDismissedIds());
  const [activeTooltips, setActiveTooltips] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setDismissedIds(loadDismissedIds());
    setIsInitialized(true);
  }, []);

  // Persist dismissals to localStorage
  useEffect(() => {
    if (isInitialized) {
      saveDismissedIds(dismissedIds);
    }
  }, [dismissedIds, isInitialized]);

  // Calculate which tooltips should be shown
  const eligibleTooltips = useMemo(() => {
    if (!isInitialized) return [];

    return highlights
      .filter((highlight) => {
        // Skip if already dismissed
        if (dismissedIds.has(highlight.id)) return false;
        // Skip if anchor element doesn't exist (graceful degradation)
        if (!elementExists(highlight.selector)) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, MAX_ACTIVE_TOOLTIPS);
  }, [highlights, dismissedIds, isInitialized]);

  // Update active tooltips when eligible ones change
  useEffect(() => {
    setActiveTooltips(eligibleTooltips);
  }, [eligibleTooltips]);

  /**
   * Dismiss a tooltip by ID
   * @param {string} id
   */
  const dismissTooltip = useCallback((id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setActiveTooltips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Dismiss all active tooltips
   */
  const dismissAll = useCallback(() => {
    const activeIds = activeTooltips.map((t) => t.id);
    setDismissedIds((prev) => {
      const next = new Set(prev);
      activeIds.forEach((id) => next.add(id));
      return next;
    });
    setActiveTooltips([]);
  }, [activeTooltips]);

  /**
   * Reset a specific tooltip to show again
   * @param {string} id
   */
  const resetTooltip = useCallback((id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Reset all dismissed tooltips
   */
  const resetAll = useCallback(() => {
    setDismissedIds(new Set());
  }, []);

  /**
   * Check if a tooltip has been dismissed
   * @param {string} id
   * @returns {boolean}
   */
  const isDismissed = useCallback(
    (id) => dismissedIds.has(id),
    [dismissedIds]
  );

  /**
   * Get the anchor element for a tooltip
   * @param {string} selector
   * @returns {Element | null}
   */
  const getAnchorElement = useCallback((selector) => {
    if (typeof document === "undefined") return null;
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }, []);

  return {
    /** Currently active tooltips (max 3) */
    activeTooltips,
    /** All tooltips that could be shown (includes those beyond limit) */
    eligibleCount: eligibleTooltips.length,
    /** Total dismissed tooltips count */
    dismissedCount: dismissedIds.size,
    /** Whether the hook has initialized from localStorage */
    isInitialized,
    /** Dismiss a specific tooltip */
    dismissTooltip,
    /** Dismiss all active tooltips */
    dismissAll,
    /** Reset a tooltip to show again */
    resetTooltip,
    /** Reset all dismissed tooltips */
    resetAll,
    /** Check if a tooltip is dismissed */
    isDismissed,
    /** Get the DOM element for a tooltip's anchor */
    getAnchorElement,
  };
}

export { MAX_ACTIVE_TOOLTIPS, STORAGE_KEY };
