# Optimistic updates with rollback (#335)

Stop hand-rolling "flip local state → run the request → revert on `catch` →
`toast.error`" in every flow. Two shared hooks own that pattern, with automatic
rollback, error toasts, and **queue safety** for rapid mutations on the same
entity:

| Hook | Use it for |
| --- | --- |
| [`useOptimisticMutation`](./useOptimisticMutation.js) | A single value (a boolean toggle, an object, a scalar) tied to one entity. |
| [`useOptimisticList`](./useOptimisticList.js) | Optimistically update or remove **one item** in a collection (moderation queues, feeds). |

## Guarantees

1. **Immediate local update.** You supply the current value plus a pure
   `applyOptimistic(current) => next` updater; the returned `value` reflects the
   optimistic state synchronously, before the network settles.
2. **Automatic rollback + toast on failure.** If the mutation promise rejects,
   the value reverts to the last known-good baseline and `toast.error(...)`
   fires. The message is overridable per hook and per call.
3. **Queue safety for the same entity.** Mutations are keyed by an entity id and
   **serialized** — a second mutation for a key waits for the first to settle
   instead of racing it. Committed state is last-write-wins on the server
   response; if any mutation in a chain fails, the value rolls back to the
   baseline captured before the chain began. All state writes are guarded
   against setState-after-unmount.

### Why serialize instead of cancel?

Two fast clicks on the same toggle, if raced, can resolve out of order and leave
the UI disagreeing with the server. Serializing per key makes the final
committed state deterministic: each queued step computes its optimistic value
from the previous step's result, and the server responses commit in order. The
rollback baseline is *frozen* for the duration of a chain, so a mid-chain
failure restores the state the user last saw confirmed — never a half-applied
intermediate. Different keys still run concurrently.

## `useOptimisticMutation` — single value

```jsx
import useOptimisticMutation from "@/hooks/useOptimisticMutation";

const { value: hidden, mutate, isPending, error } = useOptimisticMutation({
  initialValue: reel.hidden,
  key: reel.id,                       // serialize per reel
  errorMessage: "Couldn't update visibility",
});

// flip it — UI updates instantly, reverts + toasts if the PATCH fails
mutate({
  applyOptimistic: (current) => !current,
  run: (next) => setReelVisibility(reel.id, { hidden: next }),
  commit: (result, optimistic) =>
    result?.reel ? result.reel.hidden : optimistic, // trust server echo
});
```

Return surface: `{ value, mutate, isPending, error, reset }`.

`mutate(options)` returns a promise that resolves with the committed value or
rejects with the (already-toasted, already-rolled-back) error, so callers can
`await` it if they need to chain UI.

## `useOptimisticList` — one item in a collection

```jsx
import useOptimisticList from "@/hooks/useOptimisticList";

const { items: flags, updateItem, removeItem, pendingIds, isPending } =
  useOptimisticList({ initialItems: initialFlags });

// resolve → remove from list; rollback re-inserts at the original index
removeItem(flag.id, {
  run: () => resolveFlag(flag.id, "dismiss"),
  errorMessage: "Couldn't resolve flag",
});

// or mutate a field on one item
updateItem(reel.id, {
  applyOptimistic: (reel) => ({ ...reel, hidden: !reel.hidden }),
  run: (next) => setReelVisibility(reel.id, { hidden: next.hidden }),
});
```

Return surface: `{ items, setItems, updateItem, removeItem, pendingIds, isPending }`.
`pendingIds` is a `Set` of ids with an in-flight mutation — handy for disabling a
single row's controls.

## Live integrations

These flows already use the shared helper — copy them, don't re-invent:

- **Reels hide/unhide** — [`useReelModeration`](./useReelModeration.js) +
  [`ReelModerationButton`](../components/atoms/reels/ReelModerationButton.jsx),
  backed by `setReelVisibility` in `lib/actions/reels-action.js`.
- **Moderation-flag resolution** — [`useFlagResolution`](./useFlagResolution.js),
  backed by `lib/actions/admin-moderation-flags.js`.
- **Claim / unclaim** — [`useClaim`](./useClaim.js), backed by
  `lib/actions/admin-claims.js`.

## Migration note

`useFeatureFlags.toggleFlag` / `setRollout` and `useAdminTeam.demoteMember` /
`revokeMember` predate this helper and still hand-roll the pattern. New code
should use these hooks; those call sites can be migrated incrementally.
