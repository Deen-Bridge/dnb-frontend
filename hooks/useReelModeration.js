"use client";
/**
 * useReelModeration — optimistic hide/unhide for a single reel (#335).
 * ---------------------------------------------------------------------------
 * Wraps {@link useOptimisticMutation} to flip a reel's `hidden` state
 * instantly, reverting + toasting if the `PATCH /api/reels/:id/visibility`
 * mutation (stubbed in `lib/actions/reels-action`) fails. Queue safety is keyed
 * by the reel id, so mashing the hide/unhide button can't leave the toggle out
 * of sync with the server.
 *
 * This is the whole flow — no bespoke revert/toast boilerplate — which is the
 * point of the shared helper.
 *
 * @example
 * const { hidden, toggle, isPending } = useReelModeration(reel.id, reel.hidden);
 * <ReelActionButton
 *   accessibleLabel={hidden ? "Unhide reel" : "Hide reel"}
 *   pressed={hidden}
 *   disabled={isPending}
 *   onClick={toggle}
 *   icon={hidden ? <EyeOff /> : <Eye />}
 * />
 *
 * @param {string} reelId
 * @param {boolean} [initialHidden=false]
 * @returns {{ hidden: boolean, toggle: () => void, setHidden: (next: boolean) => void, isPending: boolean, error: Error|null }}
 */
import { useCallback } from "react";
import useOptimisticMutation from "@/hooks/useOptimisticMutation";
import { setReelVisibility } from "@/lib/actions/reels-action";

export default function useReelModeration(reelId, initialHidden = false) {
  const { value: hidden, mutate, isPending, error } = useOptimisticMutation({
    initialValue: Boolean(initialHidden),
    key: reelId,
    errorMessage: "Couldn't update this reel's visibility",
  });

  /** Set an explicit hidden state (optimistic, with rollback). */
  const setHidden = useCallback(
    (next) =>
      mutate({
        applyOptimistic: () => Boolean(next),
        run: (value) => setReelVisibility(reelId, { hidden: value }),
        commit: (result, optimistic) =>
          result?.reel ? Boolean(result.reel.hidden) : optimistic,
      }),
    [mutate, reelId]
  );

  /** Flip the current hidden state (optimistic, with rollback). */
  const toggle = useCallback(
    () =>
      mutate({
        applyOptimistic: (current) => !current,
        run: (value) => setReelVisibility(reelId, { hidden: value }),
        commit: (result, optimistic) =>
          result?.reel ? Boolean(result.reel.hidden) : optimistic,
      }),
    [mutate, reelId]
  );

  return { hidden, toggle, setHidden, isPending, error };
}
