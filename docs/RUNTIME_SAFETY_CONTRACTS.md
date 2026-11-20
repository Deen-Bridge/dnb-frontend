# Runtime safety contracts

This batch establishes two small, reusable client contracts:

- `lib/realtime/event-reconciler.ts` orders events by server sequence, drops
  duplicate IDs, and ignores stale deliveries. A reconnecting consumer should
  request replay from its returned `lastSequence` before rendering new state.
- `lib/stellar/payment-state.ts` keeps `submitted` and `pending` distinct from
  `confirmed`. A wallet signature or submission response is not settlement and
  must not grant access or display final success.

Both contracts are pure and deterministic so disconnect, duplicate delivery,
refresh, and delayed-settlement tests can exercise them without a live socket or
Stellar network.
