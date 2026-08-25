"use client";
/**
 * useOptimisticList — optimistic single-item updates/removals over a list (#335).
 * ===========================================================================
 * A thin, ergonomic layer over the same optimistic guarantees as
 * {@link useOptimisticMutation}, specialized for the extremely common
 * "optimistically change (or drop) *one* item in a collection" case that
 * reels moderation, flag resolution, and claim/unclaim all share.
 *
 * Guarantees (identical spirit to `useOptimisticMutation`):
 *   1. **Immediate local update** — the item mutates/disappears in `items`
 *      synchronously.
 *   2. **Auto rollback + toast on failure** — the item (and its position) is
 *      restored and `toast.error(...)` fires.
 *   3. **Per-item queue safety** — mutations are serialized by item id, so
 *      rapid actions on the *same* item can't interleave. Actions on *different*
 *      items still run concurrently.
 *
 * Rollback is positional: a removed item is re-inserted at its original index,
 * so a failed "resolve"/"remove" doesn't reorder the list.
 *
 * @example <caption>Resolve a flag, removing it optimistically</caption>
 * const { items: flags, updateItem, removeItem, isPending } =
 *   useOptimisticList({ initialItems: initialFlags });
 *
 * // resolve → remove from list, rollback re-inserts on failure
 * removeItem(flag.id, {
 *   run: () => resolveFlag(flag.id, "dismiss"),
 *   errorMessage: "Couldn't resolve flag",
 * });
 *
 * @example <caption>Toggle a field on one item</caption>
 * updateItem(reel.id, {
 *   applyOptimistic: (reel) => ({ ...reel, hidden: !reel.hidden }),
 *   run: (next) => patchReelVisibility(reel.id, { hidden: next.hidden }),
 * });
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * @template {{[k: string]: any}} Item
 * @param {Object} [config]
 * @param {Item[]} [config.initialItems=[]] Starting list.
 * @param {(item: Item) => (string|number)} [config.getId] Item id accessor.
 *   Defaults to `item.id`.
 * @param {string} [config.errorMessage="Something went wrong. Please try again."]
 *   Default failure toast.
 * @returns {{
 *   items: Item[],
 *   setItems: (next: Item[] | ((prev: Item[]) => Item[])) => void,
 *   updateItem: (id: string|number, options: {
 *     applyOptimistic: (item: Item) => Item,
 *     run: (optimisticItem: Item) => Promise<any>,
 *     commit?: (result: any, optimisticItem: Item) => Item,
 *     errorMessage?: string,
 *     onError?: (error: Error) => void,
 *     onSuccess?: () => void,
 *   }) => Promise<void>,
 *   removeItem: (id: string|number, options: {
 *     run: () => Promise<any>,
 *     errorMessage?: string,
 *     onError?: (error: Error) => void,
 *     onSuccess?: () => void,
 *   }) => Promise<void>,
 *   pendingIds: Set<string|number>,
 *   isPending: boolean,
 * }}
 */
export default function useOptimisticList({
  initialItems = [],
  getId = (item) => item.id,
  errorMessage: defaultErrorMessage = "Something went wrong. Please try again.",
} = {}) {
  const [items, setItemsState] = useState(initialItems);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const itemsRef = useRef(initialItems);
  const queuesRef = useRef(new Map()); // id -> { chain: Promise, active: boolean }
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setItems = useCallback((next) => {
    const resolved = typeof next === "function" ? next(itemsRef.current) : next;
    itemsRef.current = resolved;
    if (mountedRef.current) setItemsState(resolved);
    return resolved;
  }, []);

  const markPending = useCallback((id, on) => {
    if (!mountedRef.current) return;
    setPendingIds((prev) => {
      const nextSet = new Set(prev);
      if (on) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
  }, []);

  /**
   * Serialize `step` behind any in-flight mutation for `id`. The snapshot of
   * the list taken when the chain *starts* is the rollback baseline for every
   * step queued until it drains.
   */
  const enqueue = useCallback(
    (id, makeStep) => {
      const queues = queuesRef.current;
      let entry = queues.get(id);
      if (!entry || !entry.active) {
        entry = { chain: Promise.resolve(), baseline: itemsRef.current, active: true };
        queues.set(id, entry);
      }
      const step = makeStep(() => entry.baseline);
      const result = entry.chain.then(step, step);
      const myTail = result.then(
        () => undefined,
        () => undefined
      );
      entry.chain = myTail;
      myTail.then(() => {
        if (entry.chain === myTail) entry.active = false;
      });
      return result;
    },
    []
  );

  const updateItem = useCallback(
    (id, options) => {
      const {
        applyOptimistic,
        run,
        commit,
        errorMessage = defaultErrorMessage,
        onError,
        onSuccess,
      } = options || {};
      if (typeof applyOptimistic !== "function" || typeof run !== "function") {
        throw new Error(
          "useOptimisticList.updateItem: `applyOptimistic` and `run` are required functions."
        );
      }

      return enqueue(id, (getBaseline) => async () => {
        let optimisticItem;
        setItems((prev) =>
          prev.map((item) => {
            if (getId(item) !== id) return item;
            optimisticItem = applyOptimistic(item);
            return optimisticItem;
          })
        );
        markPending(id, true);

        try {
          const result = await run(optimisticItem);
          if (typeof commit === "function" && optimisticItem !== undefined) {
            const committed = commit(result, optimisticItem);
            setItems((prev) =>
              prev.map((item) => (getId(item) === id ? committed : item))
            );
          }
          onSuccess?.();
        } catch (err) {
          const failure = err instanceof Error ? err : new Error(String(err));
          setItems(getBaseline()); // positional restore
          toast.error(errorMessage);
          onError?.(failure);
          throw failure;
        } finally {
          markPending(id, false);
        }
      });
    },
    [defaultErrorMessage, enqueue, getId, markPending, setItems]
  );

  const removeItem = useCallback(
    (id, options) => {
      const { run, errorMessage = defaultErrorMessage, onError, onSuccess } =
        options || {};
      if (typeof run !== "function") {
        throw new Error("useOptimisticList.removeItem: `run` is a required function.");
      }

      return enqueue(id, (getBaseline) => async () => {
        setItems((prev) => prev.filter((item) => getId(item) !== id));
        markPending(id, true);

        try {
          await run();
          onSuccess?.();
        } catch (err) {
          const failure = err instanceof Error ? err : new Error(String(err));
          setItems(getBaseline()); // re-inserts at original position
          toast.error(errorMessage);
          onError?.(failure);
          throw failure;
        } finally {
          markPending(id, false);
        }
      });
    },
    [defaultErrorMessage, enqueue, getId, markPending, setItems]
  );

  return {
    items,
    setItems,
    updateItem,
    removeItem,
    pendingIds,
    isPending: pendingIds.size > 0,
  };
}
