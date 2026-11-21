"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const DEFAULT_LIST_PAGE_SIZE = 24;

/**
 * Keeps large client-side collections from rendering without a bound.
 * Filtering and sorting stay deterministic in the caller; this hook only
 * controls the rendered window and resets it when the collection changes.
 */
export default function useBoundedList(items = [], pageSize = DEFAULT_LIST_PAGE_SIZE) {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0
    ? Math.floor(pageSize)
    : DEFAULT_LIST_PAGE_SIZE;
  const [visibleCount, setVisibleCount] = useState(safePageSize);

  useEffect(() => {
    setVisibleCount(safePageSize);
  }, [items, safePageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + safePageSize, items.length));
  }, [items.length, safePageSize]);

  return {
    visibleItems,
    hasMore: visibleCount < items.length,
    loadMore,
    reset: () => setVisibleCount(safePageSize),
  };
}
