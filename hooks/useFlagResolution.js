"use client";
/**
 * useFlagResolution — optimistic moderation-flag queue (#335).
 * ---------------------------------------------------------------------------
 * Loads the open flagged-content queue via the stubbed
 * `lib/actions/admin-moderation-flags` service and resolves items with
 * {@link useOptimisticList}: the row disappears immediately, and if the
 * `resolveFlag` mutation fails it is re-inserted at its original position and a
 * toast fires. Per-flag queue safety prevents a double-click from firing two
 * resolves for the same item.
 *
 * @example
 * const { flags, isLoading, resolve, pendingIds } = useFlagResolution();
 * flags.map((f) => (
 *   <button
 *     key={f.id}
 *     disabled={pendingIds.has(f.id)}
 *     onClick={() => resolve(f.id, "dismiss")}
 *   >
 *     Resolve
 *   </button>
 * ));
 *
 * @returns {{
 *   flags: Array<object>,
 *   isLoading: boolean,
 *   error: string|null,
 *   refresh: () => Promise<void>,
 *   resolve: (id: string, resolution?: ("dismiss"|"remove_content"|"warn_author")) => Promise<void>,
 *   pendingIds: Set<string>,
 * }}
 */
import { useCallback, useEffect, useState } from "react";
import useOptimisticList from "@/hooks/useOptimisticList";
import {
  listFlaggedContent,
  resolveFlag,
} from "@/lib/actions/admin-moderation-flags";

export default function useFlagResolution() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { items: flags, setItems, removeItem, pendingIds } = useOptimisticList({
    initialItems: [],
    errorMessage: "Couldn't resolve this flag",
  });

  const load = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);
      try {
        const { flags: list } = await listFlaggedContent();
        if (!signal?.cancelled) setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!signal?.cancelled) {
          setError(err?.message || "Failed to load flagged content");
        }
      } finally {
        if (!signal?.cancelled) setIsLoading(false);
      }
    },
    [setItems]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  /** Resolve a flag optimistically, removing it from the queue. */
  const resolve = useCallback(
    (id, resolution = "dismiss") =>
      removeItem(id, {
        run: () => resolveFlag(id, resolution),
        errorMessage: "Couldn't resolve this flag",
      }),
    [removeItem]
  );

  return { flags, isLoading, error, refresh, resolve, pendingIds };
}
