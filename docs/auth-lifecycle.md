# Authentication lifecycle UX

Issue #731 requires the UI to reflect the backend result, not the button the
user last pressed. The contract is represented by
`lib/auth/lifecycle.ts` and follows these rules:

- Verification reaches `verified` only after the verification endpoint confirms
  the token. Rejected, replayed, and expired tokens remain recoverable.
- Password reset requests show a neutral success message and do not reveal
  whether an email is registered. A non-success response is never shown as
  success; invalid or expired tokens direct the user to request a new link.
- A 401 response is refreshed once for idempotent/session-safe requests. If
  refresh is rejected, the client clears the session and redirects with
  `reason=expired` or `reason=revoked`, which the login page renders through
  `SessionEndedNotice`.
- Two-factor and session-management screens should use the same vocabulary:
  `two_factor_required`, `two_factor_failed`, `session_active`,
  `session_expired`, `session_revoked`, and `signed_out`.

The state machine intentionally has no optimistic success transition. Browser
E2E coverage should exercise the same events against a test backend: pending
verification, successful verification, replay/expiry, reset failure and
success, 2FA challenge/recovery, refresh expiry, logout, and revocation. The
browser should assert both the accessible status message and the recovery
action, including the active locale.
