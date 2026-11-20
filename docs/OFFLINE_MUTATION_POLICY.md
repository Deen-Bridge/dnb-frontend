# Offline mutation policy

Payment intents are session-scoped, account-bound, short-lived, and remain
`pending` until an authoritative server or ledger response reconciles them.
They are not replayed as offline payments. Expired, corrupt, or account-mismatched
intents are discarded, and logout/account switching must clear the relevant owner
namespace.

Other mutations must explicitly declare whether they are safe to retry and must
use a server idempotency key before being added to an offline queue.
