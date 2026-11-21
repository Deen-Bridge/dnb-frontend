# Jitsi video-call runbook

The web client uses one room name for both the embedded host session and the
participant's external Jitsi window. The backend remains the source of truth
for authorization, room metadata, and JWT issuance.

## Required configuration

- `NEXT_PUBLIC_JITSI_DOMAIN` must be the Jitsi host without a path. The client
  accepts either `https://meet.example.com` or `meet.example.com`.
- Set `NEXT_PUBLIC_JITSI_REQUIRE_JWT=true` only when the backend issues a JWT
  for the configured deployment. Do not put a signing secret in a
  `NEXT_PUBLIC_*` variable.
- The backend `/api/calls/token` endpoint must accept the authenticated
  `spaceId` and return the same `meetingRoom` for the host and participants.

## Host and participant smoke test

1. Sign in as the host and open a scheduled space.
2. Select **Start Live Session**. The client marks the space live, requests
   the meeting token, and rolls the status back if token preparation fails.
3. Confirm the embedded room loads and that the browser console has no Jitsi
   connection error.
4. Sign in as two separate participants, open the same live space, and use
   **Join Live Session**. The client opens the participant window immediately
   from the click gesture, then navigates it after token issuance so popup
   blockers do not silently prevent joining.
5. Verify both participants use the same room and can publish audio/video.
6. Close or reload the host iframe. The space must remain live; use **End
   Session** to perform the explicit status transition to `ended`.

## Troubleshooting

- A blank or stalled room shows a retry action after 20 seconds. Use the
  retry action first, then **Open in New Window** to distinguish iframe issues
  from Jitsi deployment issues.
- A JWT-enabled deployment without a returned token is rejected visibly; do
  not fall back to an unauthenticated room.
- Check the browser's popup-blocker notice, the `/api/calls/token` response,
  the returned `domain` and `meetingRoom`, and Jitsi `errorOccurred` events.
- Redact access tokens, JWTs, cookies, room URLs containing credentials, and
  participant identifiers from screenshots, logs, and issue comments.
