# Mobile authentication contract

The mobile client uses the same backend identity contract as the web client. It
does not create a parallel Firebase account or exchange Firebase ID tokens.

## Credential flow

- `POST /api/auth/login` receives `{ email, password }` and returns
  `accessToken`, optional `refreshToken`, and the authenticated `user`.
- `POST /api/auth/register` receives `{ email, password, name }` and returns
  the same token/user shape.
- The access token is sent as `Authorization: Bearer <token>`.
- `GET /api/auth/me` is the source of truth for the current user after app
  startup and after either credential flow.

Tokens are stored only in Expo SecureStore. They are never logged or placed in
AsyncStorage. A 401 response attempts one refresh through
`POST /api/auth/refresh`; failure clears both tokens and requires sign-in again.

## Logout and recovery

Logout calls `POST /api/auth/logout` when available, then always clears local
tokens. A failed logout request must not leave credentials on the device. The
client re-checks `/api/auth/me` on startup, so expired or revoked sessions do
not appear authenticated after a restart.

Google sign-in must use the backend's Google exchange endpoint when enabled;
the mobile app must not persist a provider token as a backend session token.
