# Client analytics privacy boundary

## Inventory and decision

The frontend has no product analytics SDK or client-side journey-event sender.
The only browser telemetry integration is Sentry error reporting. It is
default-deny: Sentry events are dropped until the user explicitly grants
telemetry consent by storing `dnb.telemetry.consent=granted`. Removing that
value withdraws consent for subsequent events. Product analytics, advertising
identifiers, cross-site tracking, and session replay are not permitted by this
boundary.

When consent is granted, Sentry receives only minimized diagnostics:

- the current account ID may be attached, never email, name, or profile data;
- request URLs, query strings, cookies, authorization data, request bodies,
  breadcrumb messages/timestamps, and exception messages are removed;
- email addresses, bearer tokens, Stellar seeds, and URL-like strings in
  remaining fields are redacted.

## Account boundary and retention

The identity is rebound whenever the authenticated account changes and is
cleared on logout. Consent is browser-local and is not treated as account
authorization. Backend analytics and aggregate views must continue to enforce
authorization server-side; client-supplied roles, IDs, filters, or counts are
never trusted as an access boundary.

Sentry retention is governed by the configured Sentry organization/project
retention policy. This client does not create a second analytics store or copy
telemetry into cookies, URLs, or application storage beyond the consent flag.
