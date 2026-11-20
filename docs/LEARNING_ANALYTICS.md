# Learning analytics data contract

The admin learning-analytics page reads only from the authenticated backend
endpoint `GET /api/admin/analytics/engagement`. The shared Axios client sends
the session credentials and bearer token, so the page never substitutes local
fixtures or fabricated totals when the endpoint is unavailable.

Requests contain ISO `from`, `to`, and `timezone=UTC` query parameters. The
client rejects malformed, reversed, and ranges longer than 365 days before
making a request; the default range is the preceding 90 days.

The endpoint may mark a metric or section as `tracked: false`. The UI renders
an explicit “Not tracked yet” or unavailable state for those fields. Missing
backend fields are normalized to the same unavailable state, never fabricated
zeroes. API failures are allowed to reach the page error state so stale or
invented data cannot be presented as authoritative analytics.
