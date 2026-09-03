"use client";
/**
 * useOptimisticMutation — centralized optimistic-update helper with rollback (#335).
 * ===========================================================================
 * A generic hook that removes the hand-rolled "flip local state, run the
 * request, revert on catch, toast the error" boilerplate that had been copied
 * across flows (see the original `useFeatureFlags.toggleFlag`,
 * `useAdminTeam.demoteMember`, …). It provides three guarantees:
 *
 *   1. **Immediate local update.** The caller supplies the current value and a
 *      pure `applyOptimistic(current) => next` updater; the returned `value`
 *      reflects the optimistic state synchronously, before the network settles.
 *
 *   2. **Automatic rollback + toast on failure.** If the mutation promise
 *      rejects, `value` reverts to the last known-good baseline and
 *      `toast.error(...)` fires (message overridable per-call or per-hook).
 *
 *   3. **Queue safety for the same entity.** Rapid mutations keyed by the same
 *      entity id are *serialized* (queued to run after the in-flight one) so two
 *      overlapping requests can never interleave into an inconsistent state.
 *      Committed state is last-write-wins on the server response; if any
 *      mutation in a chain fails, `value` rolls back to the baseline captured
 *      before the chain began. All state writes are guarded against
 *      setState-after-unmount.
 *
 * ---------------------------------------------------------------------------
 * Queue-safety model (the important part)
 * ---------------------------------------------------------------------------
 * Each `mutate` call carries an entity `key` (defaults to the hook-level
 * `key`, else `"__default__"`). Calls sharing a key run strictly one after
 * another — the optimistic value of call N+1 is computed from the optimistic
 * value produced by call N, and the server responses are committed in order.
 * The *baseline* (rollback target) for a key is the value at the moment the
 * key's queue became empty; while a chain is running the baseline is frozen, so
 * a mid-chain failure restores the state the user last saw as confirmed rather
 * than some half-applied intermediate.
 *
 * @example <caption>Toggle a single boolean value</caption>
 * const { value: hidden, mutate, isPending } = useOptimisticMutation({
 *   initialValue: reel.hidden,
 *   key: reel.id,
 * });
 * // flip it — UI updates instantly, reverts + toasts if the PATCH fails
 * mutate({
 *   applyOptimistic: (current) => !current,
 *   run: (next) => patchReelVisibility(reel.id, { hidden: next }),
 *   errorMessage: "Couldn't update visibility",
 * });
 *
 * @example <caption>Rapid same-entity clicks stay consistent</caption>
 * // Two fast clicks on the same reel are queued, not raced:
 * mutate({ applyOptimistic: (c) => !c, run: (n) => patch(reelId, n) });
 * mutate({ applyOptimistic: (c) => !c, run: (n) => patch(reelId, n) });
 * // final `value` == server's response to the *second* request; a failure in
 * // either reverts to the value shown before the first click.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_KEY = "__default__";

/**
 * @template T
 * @typedef {Object} OptimisticMutateOptions
 * @property {(current: T) => T} applyOptimistic Pure updater producing the next
 *   optimistic value from the current one. Must not mutate `current`.
 * @property {(optimisticValue: T) => Promise<any>} run The async mutation. It
 *   receives the optimistic value it should persist.
 * @property {(result: any, optimisticValue: T) => T} [commit] Maps the resolved
 *   server result to the committed value. Defaults to keeping the optimistic
 *   value (assumes the server echoed the change).
 * @property {string} [key] Entity key for queue serialization. Defaults to the
 *   hook-level `key`.
 * @property {string} [errorMessage] Toast shown on failure (overrides the
 *   hook-level default).
 * @property {(error: Error) => void} [onError] Extra failure handler run after
 *   rollback + toast.
 * @property {() => void} [onSuccess] Run after a successful commit.
 */

/**
 * @template T
 * @param {Object} [config]
 * @param {T} [config.initialValue] Starting value / rollback baseline.
 * @param {string} [config.key] Default entity key for queue serialization.
 * @param {string} [config.errorMessage="Something went wrong. Please try again."]
 *   Default failure toast message.
 * @returns {{
 *   value: T,
 *   mutate: (options: OptimisticMutateOptions<T>) => Promise<T>,
 *   isPending: boolean,
 *   error: Error | null,
 *   reset: (nextValue?: T) => void,
 * }}
 */
export default function useOptimisticMutation({
  initialValue,
  key: defaultKey,
  errorMessage: defaultErrorMessage = "Something went wrong. Please try again.",
} = {}) {
  const [value, setValueState] = useState(initialValue);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState(null);

  // Authoritative value, readable synchronously inside queued work without
  // waiting for a state flush. `value` (state) mirrors it for rendering.
  const valueRef = useRef(initialValue);
  // Per-key queue bookkeeping: { chain: Promise, baseline: T, active: boolean }.
  const queuesRef = useRef(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** Commit a value to both the ref and (if mounted) React state. */
  const setValue = useCallback((next) => {
    valueRef.current = next;
    if (mountedRef.current) setValueState(next);
  }, []);

  /** Imperatively replace the value and clear error/queue baselines. */
  const reset = useCallback(
    (nextValue = initialValue) => {
      setValue(nextValue);
      if (mountedRef.current) setError(null);
      queuesRef.current.clear();
    },
    [initialValue, setValue]
  );

  const mutate = useCallback(
    (options) => {
      const {
        applyOptimistic,
        run,
        commit,
        key = defaultKey ?? DEFAULT_KEY,
        errorMessage = defaultErrorMessage,
        onError,
        onSuccess,
      } = options || {};

      if (typeof applyOptimistic !== "function" || typeof run !== "function") {
        throw new Error(
          "useOptimisticMutation: `applyOptimistic` and `run` are required functions."
        );
      }

      const queues = queuesRef.current;
      let entry = queues.get(key);
      if (!entry || !entry.active) {
        // Starting a fresh chain for this key: freeze the current value as the
        // rollback baseline for everything queued until the chain drains.
        entry = { chain: Promise.resolve(), baseline: valueRef.current, active: true };
        queues.set(key, entry);
      }

      const step = async () => {
        // Compute optimistic value from the *current* (post-previous-step) value
        // so chained updates compose deterministically.
        const optimisticValue = applyOptimistic(valueRef.current);
        setValue(optimisticValue);
        if (mountedRef.current) {
          setPendingCount((c) => c + 1);
          setError(null);
        }

        try {
          const result = await run(optimisticValue);
          const committed =
            typeof commit === "function" ? commit(result, optimisticValue) : optimisticValue;
          setValue(committed);
          onSuccess?.();
          return committed;
        } catch (err) {
          const failure = err instanceof Error ? err : new Error(String(err));
          // Roll back to the baseline captured before this chain started.
          setValue(entry.baseline);
          if (mountedRef.current) setError(failure);
          toast.error(errorMessage);
          onError?.(failure);
          throw failure;
        } finally {
          if (mountedRef.current) setPendingCount((c) => Math.max(0, c - 1));
        }
      };

      // Serialize: this step only runs after the key's current chain settles.
      // Swallowing settlement (`() => undefined`) keeps one rejected step from
      // breaking the queue for later calls, while `result` still surfaces the
      // rejection to *this* caller.
      const result = entry.chain.then(step, step);
      const myTail = result.then(
        () => undefined,
        () => undefined
      );
      entry.chain = myTail;

      // When *this* tail is still the queue's active tail once it settles, the
      // chain has fully drained: release the baseline so the next mutation
      // captures a fresh (now-confirmed) rollback target.
      myTail.then(() => {
        if (entry.chain === myTail) entry.active = false;
      });

      return result;
    },
    [defaultKey, defaultErrorMessage, setValue]
  );

  return {
    value,
    mutate,
    isPending: pendingCount > 0,
    error,
    reset,
  };
}
