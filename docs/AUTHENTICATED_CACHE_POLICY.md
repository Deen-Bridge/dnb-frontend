# Authenticated cache policy

Issue [#738](https://github.com/Deen-Bridge/dnb-frontend/issues/738) requires
client caches to be an authorization boundary, not just a TTL optimization.

`setCacheScope(accountId)` prefixes every `cachedFetch` key with the current
account scope. Changing scope clears memory, session, and local cache entries
before the next account can read. The unauthenticated scope is explicitly
`public:` and cannot read an authenticated `account:` entry, even when a
resource identifier is reused.

The auth provider sets the scope after login/bootstrap and clears it on logout
or account switch. Existing unscoped entries are cleared during the first scope
transition, providing a migration path for old browser profiles. Sensitive
data must use `cachedFetch` with the default scope behavior; direct storage of
authenticated responses is not permitted.

Required regression coverage includes login/cache/logout/second-login,
account switching, browser reload, expiry, and reused-resource identifiers.
