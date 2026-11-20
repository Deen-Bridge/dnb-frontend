"use client";
/**
 * useClaim — optimistic claim / unclaim of a moderation-queue item (#335).
 * ---------------------------------------------------------------------------
 * Wraps {@link useOptimisticMutation} so claiming feels instant: the button
 * flips to "claimed" immediately, then the `claim`/`unclaim` mutation (stubbed
 * in `lib/actions/admin-claims`) runs. On failure the claim state reverts and a
 * toast fires. Queue safety is keyed by the item id, so a fast claim→unclaim
 * double-tap resolves deterministically to the last request's server result.
 *
 * @example
 * const { claimed, claimedBy, toggle, isPending } = useClaim(item.id, item.claim);
 * <Button disabled={isPending} onClick={toggle}>
 *   {claimed ? `Claimed by ${claimedBy?.name}` : "Claim"}
 * </Button>
 *
 * @param {string} itemId queue-item id
 * @param {{claimedBy?: {id: string, name: string}|null, claimedAt?: string|null}} [initialClaim]
 * @returns {{
 *   claimed: boolean,
 *   claimedBy: {id: string, name: string}|null,
 *   claimedAt: string|null,
 *   claim: () => Promise<object>,
 *   unclaim: () => Promise<object>,
 *   toggle: () => Promise<object>,
 *   isPending: boolean,
 *   error: Error|null,
 * }}
 */
import { useCallback } from "react";
import useOptimisticMutation from "@/hooks/useOptimisticMutation";
import { claim as claimAction, unclaim as unclaimAction } from "@/lib/actions/admin-claims";

const EMPTY_CLAIM = { claimedBy: null, claimedAt: null };

export default function useClaim(itemId, initialClaim = EMPTY_CLAIM) {
  const { value, mutate, isPending, error } = useOptimisticMutation({
    initialValue: {
      claimedBy: initialClaim?.claimedBy ?? null,
      claimedAt: initialClaim?.claimedAt ?? null,
    },
    key: itemId,
    errorMessage: "Couldn't update the claim",
  });

  const claim = useCallback(
    () =>
      mutate({
        applyOptimistic: () => ({
          claimedBy: { id: "me", name: "You" },
          claimedAt: new Date().toISOString(),
        }),
        run: () => claimAction(itemId),
        commit: (result, optimistic) =>
          result?.claim
            ? { claimedBy: result.claim.claimedBy, claimedAt: result.claim.claimedAt }
            : optimistic,
        errorMessage: "Couldn't claim this item",
      }),
    [mutate, itemId]
  );

  const unclaim = useCallback(
    () =>
      mutate({
        applyOptimistic: () => ({ claimedBy: null, claimedAt: null }),
        run: () => unclaimAction(itemId),
        commit: (result, optimistic) =>
          result?.claim
            ? { claimedBy: result.claim.claimedBy, claimedAt: result.claim.claimedAt }
            : optimistic,
        errorMessage: "Couldn't release this item",
      }),
    [mutate, itemId]
  );

  const toggle = useCallback(
    () => (value.claimedBy ? unclaim() : claim()),
    [value.claimedBy, claim, unclaim]
  );

  return {
    claimed: Boolean(value.claimedBy),
    claimedBy: value.claimedBy,
    claimedAt: value.claimedAt,
    claim,
    unclaim,
    toggle,
    isPending,
    error,
  };
}
