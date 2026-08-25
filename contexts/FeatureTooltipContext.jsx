"use client";
/**
 * FeatureTooltipContext — context provider for feature announcements (#304)
 * -------------------------------------------------------------------------
 * Provides centralized management of feature announcement tooltips across
 * the application. Fetches highlight definitions from the admin API and
 * exposes them via context to the FeatureTooltipOverlay component.
 *
 * Architecture:
 * - FeatureTooltipProvider wraps the app (or a section of it)
 * - FeatureTooltipOverlay renders the actual tooltips
 * - useFeatureTooltipContext() hook for accessing tooltip state
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import useFeatureTooltips from "@/hooks/useFeatureTooltips";

const FeatureTooltipContext = createContext(null);

// Default highlights for development/fallback
const DEFAULT_HIGHLIGHTS = [];

/**
 * Fetch feature highlights from the admin API
 * @returns {Promise<Array>}
 */
async function fetchHighlights() {
  try {
    // TODO: Replace with actual API endpoint when available
    // const response = await fetch("/api/admin/feature-highlights");
    // if (!response.ok) throw new Error("Failed to fetch highlights");
    // const data = await response.json();
    // return data.highlights || [];

    // Simulate API call with mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));
    return DEFAULT_HIGHLIGHTS;
  } catch (error) {
    console.error("Failed to fetch feature highlights:", error);
    return DEFAULT_HIGHLIGHTS;
  }
}

/**
 * Provider component for feature tooltips
 */
export function FeatureTooltipProvider({ children, initialHighlights = null }) {
  const [highlights, setHighlights] = useState(initialHighlights || []);
  const [isLoading, setIsLoading] = useState(!initialHighlights);
  const [error, setError] = useState(null);

  // Load highlights on mount if not provided
  useEffect(() => {
    if (initialHighlights) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchHighlights()
      .then((data) => {
        if (!cancelled) {
          setHighlights(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialHighlights]);

  // Use the tooltip management hook
  const tooltipManager = useFeatureTooltips(highlights);

  // Refresh highlights from API
  const refreshHighlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHighlights();
      setHighlights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new highlight (for admin interface)
  const addHighlight = useCallback((highlight) => {
    setHighlights((prev) => [...prev, highlight]);
  }, []);

  // Remove a highlight (for admin interface)
  const removeHighlight = useCallback((id) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Update a highlight (for admin interface)
  const updateHighlight = useCallback((id, updates) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const value = useMemo(
    () => ({
      // Highlight definitions
      highlights,
      isLoading,
      error,
      refreshHighlights,
      // Admin operations
      addHighlight,
      removeHighlight,
      updateHighlight,
      // Tooltip management (from hook)
      ...tooltipManager,
    }),
    [
      highlights,
      isLoading,
      error,
      refreshHighlights,
      addHighlight,
      removeHighlight,
      updateHighlight,
      tooltipManager,
    ]
  );

  return (
    <FeatureTooltipContext.Provider value={value}>
      {children}
    </FeatureTooltipContext.Provider>
  );
}

/**
 * Hook to access the feature tooltip context
 * @returns {Object} Feature tooltip context value
 */
export function useFeatureTooltipContext() {
  const context = useContext(FeatureTooltipContext);
  if (!context) {
    throw new Error(
      "useFeatureTooltipContext must be used within a FeatureTooltipProvider"
    );
  }
  return context;
}

/**
 * Hook for components that only need to check if they should show a tooltip
 * @param {string} id - The highlight ID to check
 * @returns {Object} Simple tooltip state for a single highlight
 */
export function useFeatureTooltipFor(id) {
  const context = useContext(FeatureTooltipContext);

  if (!context) {
    // Return a safe default if not within provider
    return {
      isActive: false,
      dismiss: () => {},
      highlight: null,
    };
  }

  const { activeTooltips, dismissTooltip, highlights } = context;
  const isActive = activeTooltips.some((t) => t.id === id);
  const highlight = highlights.find((h) => h.id === id) || null;

  return {
    isActive,
    dismiss: () => dismissTooltip(id),
    highlight,
  };
}

export default FeatureTooltipContext;
