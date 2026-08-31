"use client";

import { useState, useCallback, useMemo } from "react";

export interface FlaggedItem {
  flagCount?: number;
  [key: string]: any; // TODO(types): Flagged item properties
}

export interface UseFlaggedContentOptions {
  initialFlaggedOnly?: boolean;
}

export interface UseFlaggedContentResult<T extends FlaggedItem> {
  flaggedCount: number;
  showFlaggedOnly: boolean;
  toggleFlaggedOnly: () => void;
  filteredItems: T[];
}

export default function useFlaggedContent<T extends FlaggedItem = FlaggedItem>(
  items: T[] = [],
  { initialFlaggedOnly = false }: UseFlaggedContentOptions = {}
): UseFlaggedContentResult<T> {
  const [showFlaggedOnly, setShowFlaggedOnly] = useState<boolean>(initialFlaggedOnly);

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
