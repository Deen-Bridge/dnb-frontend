# Account deletion and client cleanup

The account settings danger zone requires a password step-up before calling the
authenticated self-delete endpoint. The UI exposes `requested`, `processing`,
`completed`, and `failed` states and only clears browser data after the server
confirms deletion.

On completion the client removes account-scoped local/session storage, cache
storage, service-worker registrations, the push subscription, and auth state.
Appearance preferences are intentionally retained. Cleanup is best effort so a
stale push provider or unavailable browser storage cannot leave the UI claiming
that server deletion failed.

## Backend contract

The current frontend calls `DELETE /api/users/:id` for the authenticated user
and sends `Idempotency-Key` plus `X-Reauth-At` headers. The backend should make
that operation idempotent and implement the full lifecycle behind it:

1. verify the step-up proof and create a deletion request;
2. keep a documented grace period and allow cancellation during that period;
3. delete primary records and derived stores (analytics, notifications,
   search/index data, object storage, mobile secure-storage references);
4. return a stable completed status for duplicate requests; and
5. revoke all sessions and push subscriptions.

Until those server guarantees are available, the UI does not claim that a
client-only cleanup replaces backend deletion or data-retention obligations.
