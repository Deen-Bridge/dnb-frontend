"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Shared hook for flag-integration across content types (courses, reels, spaces).
 *
 * Provides flag counts, flagged-only filtering, and toggle state for any list
 * of items that carry a `flagCount` property.
 *
 * @param {Array<{flagCount?: number}>} items - The full list of content items.
 * @param {object} [options]
 * @param {boolean} [options.initialFlaggedOnly=false]
 * @returns {{
 *   flaggedCount: number,
 *   showFlaggedOnly: boolean,
 *   toggleFlaggedOnly: () => void,
 *   filteredItems: Array,
 * }}
 */
export default function useFlaggedContent(items = [], { initialFlaggedOnly = false } = {}) {
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(initialFlaggedOnly);

  const flaggedCount = useMemo(
    () => items.filter((item) => (item.flagCount ?? 0) > 0).length,
    [items]
  );

  const filteredItems = useMemo(
    () =>
      showFlaggedOnly
        ? items.filter((item) => (item.flagCount ?? 0) > 0)
        : items,
    [items, showFlaggedOnly]
  );

  const toggleFlaggedOnly = useCallback(() => {
    setShowFlaggedOnly((prev) => !prev);
  }, []);

  return { flaggedCount, showFlaggedOnly, toggleFlaggedOnly, filteredItems };
}
