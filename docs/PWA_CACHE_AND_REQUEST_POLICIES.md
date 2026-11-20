# PWA cache and request policies

## Navigation cache isolation (FE-010, #703)

Only the public navigation allowlist in `lib/pwa/cache-policy.js` can use the
`dnb-runtime-public-pages-<release>` runtime cache. Dashboard, account, admin,
scholarship, payment, messaging, profile, library, settings, and
educator-onboarding routes are network-only, including localized paths such as
`/en/dashboard`. API responses are network-only, including book previews,
because response privacy cannot be proven at the service-worker boundary.

Runtime caches are release-scoped by `app/sw.js`. Private navigations and
requests carrying account credentials are never persisted. The service worker
deletes legacy private runtime caches on activation and clears all runtime
caches when it receives `CLEAR_PRIVATE_CACHES`. The web logout and account
switch paths send that message, while logout also clears the account-scoped
client caches. The offline document is a generic public page and is never
populated with account data.

## Bounded request policy (FE-012, #705)

`lib/config/request-policy.ts` defines the operation budgets:

| Operation | Timeout | Attempts | Retry scope |
| --- | ---: | ---: | --- |
| Auth | 15s | 1 | Never |
| Search | 10s | 3 | GET, 408/429/5xx |
| Upload | 60s | 1 | Never |
| Payment | 30s | 1 | Never |
| Call | 20s | 2 | GET, 408/429/5xx |
| Background/default | 15s | 2 | GET/HEAD/OPTIONS, 408/429/5xx |

Retries use capped exponential backoff with jitter, honor numeric `Retry-After`
values up to eight seconds, and are cancelled by the request's `AbortSignal`.
Mutations remain single-attempt unless a caller explicitly supplies an
idempotency contract through the existing opt-in flag. Auth refreshes are
single-attempt and session expiry redirects retain the upstream reason code.
