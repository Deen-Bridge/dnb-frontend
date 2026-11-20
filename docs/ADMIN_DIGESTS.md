# Scheduled admin digests

The scheduled-digest settings page is a client for the authenticated backend
API. It does not seed recipients, persist configuration in browser memory, or
pretend a save succeeded when the service is unavailable.

## Backend contract

- `GET /api/admin/digests` returns `{ "config": DigestConfig }`.
- `PUT /api/admin/digests` accepts a complete `DigestConfig` and returns the
  saved `{ "config": DigestConfig }`.
- Both routes require an authenticated admin session. The backend must repeat
  schedule and recipient validation and enforce the admin tier.

The shared `axiosInstance` attaches the current session credentials. Any
authentication, network, or server error is propagated to the page, which
shows an unavailable state and offers a retry. There is no browser-local
fallback, so stale or invented recipient addresses cannot be displayed or
saved.

Client validation remains useful for immediate feedback, but it is not a
security boundary and does not replace backend validation.
