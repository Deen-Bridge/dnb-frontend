# Mobile release, diagnostics, and recovery policy

This policy covers the Expo/EAS mobile client. It is intentionally separate
from web Sentry because native crash handling, release builds, and OTA
recovery have different failure modes.

## Diagnostics and privacy

- Diagnostics are opt-in (`mobile_diagnostics_consent`); no DSN means no
  reporting. Opting out disables the SDK and closes its queue.
- `@sentry/react-native` captures JavaScript and native crashes only after
  consent. `sendDefaultPii` is disabled, breadcrumbs/request/user fields are
  removed, and `mobile/lib/diagnostics/privacy.ts` redacts tokens, emails,
  wallet addresses, payment/document fields, and message content.
- Events contain only release, build, platform, runtime, and a bounded route
  pattern. The native SDK queue is bounded to 20 items and retries when the
  device is online; upload failure never blocks startup.
- Release health alert: page the mobile owner when crash-free sessions fall
  below 99.5% or a release has 5+ identical crashes in 15 minutes. The owner
  pauses rollout, confirms whether the issue is native/JS/backend, and links
  the release and symbolication artifact.
- Source maps and native symbols are uploaded only from the trusted EAS CI
  release job. They are not shipped in the app or exposed to contributors.

## Version and OTA policy

- `runtimeVersion` follows the native app version. Native changes (permissions,
  modules, ABI, signing, or API contract changes) require a new store build;
  they must not be delivered by OTA.
- OTA updates are limited to JavaScript/assets compatible with that runtime.
  EAS channels and environment values are isolated for development, preview,
  and production. Production uses staged rollout with health checks at 10%,
  25%, 50%, and 100%.
- Every release records the app version, build number, runtime, channel,
  commit, migration notes, and rollback target. Signing credentials stay in
  EAS; CI verifies the expected project/channel before publishing.
- The backend rejects unsupported clients with HTTP 426 and a body such as
  `{ "code": "MOBILE_VERSION_UNSUPPORTED", "minimumVersion": "0.2.0", "storeUrl": "..." }`.
  The client gates navigation with localized copy and never sends auth data in
  the upgrade response.
- If health checks regress, pause the rollout and repoint the channel to the
  last known-good compatible update. If the bundle is revoked or cannot load,
  Expo's cached native bundle remains the recovery path; a new store build is
  required when the runtime is affected. Emergency disablement is performed by
  disabling the channel/update and raising the backend minimum version.

## Test and incident checklist

Before production: test offline startup, interrupted update, old client/426,
revoked update, rollback, crash capture, upload failure, logout, account
deletion, and diagnostics-disabled behavior. The mobile owner is responsible
for release approval, alert response, rollback, and the post-incident note;
the backend owner is responsible for minimum-version enforcement.
