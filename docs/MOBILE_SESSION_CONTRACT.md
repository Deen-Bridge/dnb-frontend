# Mobile session contract

Issue [#727](https://github.com/Deen-Bridge/dnb-frontend/issues/727) uses
Firebase as the mobile session authority. The app stores the Firebase ID token
as its short-lived API access token and registers `getIdToken(true)` as the
single refresh provider. It no longer writes an empty backend refresh token.

On a 401, the Axios client coalesces concurrent requests behind that provider,
stores the newly issued access token, and retries each original request once.
If Firebase refresh fails, the queue is rejected and all sensitive storage is
cleared. Logout and account switching unregister the provider before clearing
tokens. A backend refresh token remains supported for a future explicitly
configured session provider, but it is never created with an empty value.

The sequence is:

1. Firebase signs in and returns an ID token.
2. The ID token is stored in secure storage and sent as the API bearer token.
3. An expired token invokes Firebase's forced refresh path.
4. Concurrent 401s share the same refresh promise and retry once.
5. Refresh failure clears tokens and the sensitive offline/profile key set.
