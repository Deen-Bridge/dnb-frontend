# Payment intent recovery

Issue [#764](https://github.com/Deen-Bridge/dnb-frontend/issues/764) limits
browser storage to a versioned, account-scoped pointer containing the backend
transaction ID, item ID, and expiry. It never stores a client-confirmed status
and cannot be read under another account's namespace.

`recoverPaymentIntent` fetches authoritative status from the payment API. A
missing, malformed, expired, or terminal pointer is cleared; an unavailable
API returns `unknown` and cannot be treated as confirmed or failed. Logout and
account switching should call `clearPaymentIntent(userId)`.
