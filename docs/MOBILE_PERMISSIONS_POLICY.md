# Mobile permissions policy

The mobile app requests permissions just in time, when a user starts the
feature that needs them. Startup and screen-resume paths only read permission
state and never trigger a prompt.

- Camera access is limited to liveness/profile capture.
- Photo-library access is limited to a user-selected upload.
- Android legacy external-storage permissions are not declared; Expo's media
  picker owns the platform-scoped access flow.
- `granted` and iOS `limited` access may continue; `denied` and
  `undetermined` access must show a non-blocking recovery path.
- Features must re-read permission state after resume so a revoked permission
  cannot leave stale UI claiming that capture or upload is available.

The helper in `mobile/lib/permissions/media.ts` intentionally separates
read-only checks from prompts, making permission decisions testable and
preventing background or startup prompts.
