# Authenticated AI chat cache policy

Issue [#739](https://github.com/Deen-Bridge/dnb-frontend/issues/739) requires
chat history to be authorized before either a network request or a cache read.

`loadChatHistory` and `loadChatMessages` now require the browser auth cookie and
an active account cache scope. They forward the bearer token to the AI service,
and the shared cache prefixes entries with that account scope. A missing or
changed session therefore cannot read a warm entry for another user. Logout,
account deletion, and account switching clear the scope through the auth
provider.

The `forceRefresh` argument is the security-sensitive escape hatch for revoked
permissions or server-side changes. It bypasses the cache while retaining the
same authorization requirement. The API must still enforce ownership of the
requested user/chat identifier; the client cache is not an authorization
boundary by itself.
