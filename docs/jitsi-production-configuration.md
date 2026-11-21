# Production video configuration

Production builds fail during environment validation unless both of these
public configuration values are set:

```dotenv
NEXT_PUBLIC_JITSI_DOMAIN=video.example.com
NEXT_PUBLIC_JITSI_REQUIRE_JWT=true
```

The production frontend does not use the public `meet.jit.si` default. Before
opening or mounting a room, it requests a meeting token from the backend. The
backend must authorize the current user for the space and return a token
scoped to the room with an expiry. A missing token, an invalid response, or a
failed authorization leaves the meeting closed and shows an actionable error.

Local development can explicitly use `meet.jit.si` with JWT disabled, but that
configuration must not be promoted to a production build. Staging call
evidence should include only a sanitized request status, deployment commit,
and CI links; never include JWTs, cookies, or authorization headers.
