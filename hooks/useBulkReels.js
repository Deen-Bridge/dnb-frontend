"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

const CONFIRMATION_THRESHOLD = 20;

/**
 * Sequential fan-out: process items one at a time, report progress via
 * callback, and return a summary.
 *
 * @param {Array} items – items to process
 * @param {(item, index, total) => Promise<{ok: boolean, error?: string}>} handler
 * @param {(completed, total) => void} onProgress
 * @returns {Promise<{succeeded: number, failed: number, errors: string[]}>}
 */
async function sequentialFanOut(items, handler, onProgress) {
  let succeeded = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await handler(items[i], i, items.length);
      if (result?.ok) {
        succeeded++;
      } else {
        failed++;
        if (result?.error) errors.push(result.error);
      }
    } catch (err) {
      failed++;
      errors.push(err?.message || `Failed to process item ${i + 1}`);
    }
    onProgress?.(i + 1, items.length);
  }

  return { succeeded, failed, errors };
}

/**
 * Hook for bulk reel moderation (#269).
 *
 * Manages multi-select state, keyboard navigation, and sequential
 * fan-out for hide/unhide operations with typed confirmation for
 * large batches (20+ items).
 *
 * @param {object} options
 * @param {Array} options.reels – current reel list
 * @param {Function} options.setReels – setter for reel list
 * @param {Function} options.mutateReel – single-reel mutation (id, changes) => updated reel
 * @param {(id: string, action: "hide"|"unhide", reason?: string) => Promise<{ok: boolean, error?: string}>} options.apiAction
 *
 * @returns {{
 *   selectedIds: Set<string>,
 *   toggleSelect: (id: string) => void,
 *   toggleSelectAll: () => void,
 *   clearSelection: () => void,
 *   isSelected: (id: string) => boolean,
 *   selectedCount: number,
 *   highlightedIndex: number,
 *   setHighlightedIndex: (i: number) => void,
 *   moveHighlight: (delta: number) => void,
 *   bulkHide: (reason: string) => Promise<void>,
 *   bulkUnhide: (reason: string) => Promise<void>,
 *   processing: boolean,
 *   progress: { completed: number, total: number } | null,
 *   needsConfirmation: boolean,
 *   setConfirmed: (v: boolean) => void,
 *   confirmed: boolean,
 * }}
 */
export default function useBulkReels({
  reels,
  setReels,
  mutateReel,
  apiAction,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const selectedCount = selectedIds.size;

  const needsConfirmation = selectedCount >= CONFIRMATION_THRESHOLD;

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setConfirmed(false);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === reels.length) {
        return new Set();
      }
      return new Set(reels.map((r) => r.id));
    });
    setConfirmed(false);
  }, [reels]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setConfirmed(false);
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  const moveHighlight = useCallback(
    (delta) => {
      setHighlightedIndex((prev) => {
        const next = prev + delta;
        return Math.max(0, Math.min(next, reels.length - 1));
      });
    },
    [reels.length],
  );

  /**
   * Execute a bulk action using sequential fan-out.
   * Shows progress toasts and a final summary.
   *
   * @param {"hide"|"unhide"} action
   * @param {string} reason
   */
  const executeBulk = useCallback(
    async (action, reason) => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;

      setProcessing(true);
      setProgress({ completed: 0, total: ids.length });

      const toastId = toast.loading(`${action === "hide" ? "Hiding" : "Unhiding"} reels…`, {
        description: `0 of ${ids.length} processed`,
      });

      const { succeeded, failed, errors } = await sequentialFanOut(
        ids,
        async (id) => {
          const result = await apiAction(id, action, reason);
          if (result?.ok) {
            // Mutate local state on success
            setReels((prev) =>
              prev.map((r) =>
                r.id === id ? mutateReel(r, { hidden: action === "hide" }) : r,
              ),
            );
          }
          return result;
        },
        (completed, total) => {
          setProgress({ completed, total });
          toast.loading(`${action === "hide" ? "Hiding" : "Unhiding"} reels…`, {
            id: toastId,
            description: `${completed} of ${total} processed`,
          });
        },
      );

      // Final summary toast
      if (failed === 0) {
        toast.success(
          `${action === "hide" ? "Hidden" : "Unhidden"} ${succeeded} reel${succeeded !== 1 ? "s" : ""}`,
          { id: toastId },
        );
      } else {
        toast.error(
          `${failed} of ${ids.length} failed`,
          {
            id: toastId,
            description: errors.length > 0 ? errors[0] : "Unknown error",
          },
        );
      }

      clearSelection();
      setProcessing(false);
      setProgress(null);
      setConfirmed(false);
    },
    [selectedIds, apiAction, setReels, mutateReel, clearSelection],
  );

  const bulkHide = useCallback(
    (reason) => executeBulk("hide", reason),
    [executeBulk],
  );

  const bulkUnhide = useCallback(
    (reason) => executeBulk("unhide", reason),
    [executeBulk],
  );

  return useMemo(
    () => ({
      selectedIds,
      toggleSelect,
      toggleSelectAll,
      clearSelection,
      isSelected,
      selectedCount,
      highlightedIndex,
      setHighlightedIndex,
      moveHighlight,
      bulkHide,
      bulkUnhide,
      processing,
      progress,
      needsConfirmation,
      setConfirmed,
      confirmed,
    }),
    [
      selectedIds,
      toggleSelect,
      toggleSelectAll,
      clearSelection,
      isSelected,
      selectedCount,
      highlightedIndex,
      moveHighlight,
      bulkHide,
      bulkUnhide,
      processing,
      progress,
      needsConfirmation,
      confirmed,
    ],
  );
}
