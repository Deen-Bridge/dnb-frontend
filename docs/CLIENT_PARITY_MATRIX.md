# Web/mobile contract parity matrix

Issue [#726](https://github.com/Deen-Bridge/dnb-frontend/issues/726) requires
security and lifecycle guarantees to be explicit across both clients. This
matrix is the release checklist for changes that cross the web/mobile boundary.

| Capability | Web contract | Mobile contract | Storage/retention | Logout/deletion invariant |
| --- | --- | --- | --- | --- |
| Auth/session | HTTP-only/session cookies and the shared API response schema | Firebase identity is exchanged for backend access/refresh credentials | Web cookies plus bounded browser caches; mobile `expo-secure-store` only | Remove cookies, secure tokens, and cached user data before navigation |
| API/offline | Axios client with bounded retries and no private service-worker responses | Axios client with a bounded timeout and coalesced refresh queue | No authenticated response in a public cache; offline mutations must be explicit | Drop pending private mutations when the account is cleared |
| Notifications | Browser permission and server-authoritative subscription state | Device permission and server-authoritative token state | Tokens are scoped to the account and never logged | Unregister/remove the device token on account removal |
| Payments | Server-authoritative payment intent and session storage | Same API intent contract; no client-created settlement state | Expiring, account-bound intent metadata only | Clear intent metadata and cached payment views |
| Calls | Configured Jitsi domain and JWT policy | Configured call provider and session policy | No call token in general-purpose storage | End the session and clear call state |
| Localization | `next-intl` route locale | Mobile i18n locale | Locale is non-sensitive | Preserve locale, never preserve account data |
| Account deletion | Server deletion is authoritative; clear browser caches afterward | Server deletion is authoritative; `secureClearSensitiveData` runs afterward | No profile, token, or offline queue survives | Both clients return to an unauthenticated state |

## Release evidence

Every cross-client PR must include:

1. the affected row(s) and API schema or endpoint;
2. a web test and a mobile test, or an explicit explanation when one client is
   not affected;
3. a logout/account-switch trace showing private state was cleared; and
4. a redacted staging trace with tokens, emails, and wallet identifiers removed.

The web auth provider already removes its auth cookies and runtime caches on
logout. The mobile API client centralizes cleanup through
`secureClearSensitiveData`, which includes current and reserved offline/profile
keys so future features cannot accidentally leave account state behind.
