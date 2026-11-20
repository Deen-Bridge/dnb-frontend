# HttpOnly session contract

The frontend relies on the backend to set and clear access and refresh
cookies. The cookies must be HttpOnly, Secure in production, and use an
explicit SameSite policy. The frontend sends withCredentials and never reads
the access token, constructs an Authorization header, or places a token in a URL.

The readable userInfo cookie contains display metadata only. It is not an
authentication credential and must not be trusted for authorization. The
backend remains the source of truth for every protected request.

Login, Google login, and Stellar login responses must set server cookies.
Refresh rotates them server-side, and logout clears them server-side. The SSE
notification endpoint authenticates from the cookie; it must not accept a
token query parameter. State-changing requests require backend CSRF protection
when the selected SameSite policy permits cross-site requests.
