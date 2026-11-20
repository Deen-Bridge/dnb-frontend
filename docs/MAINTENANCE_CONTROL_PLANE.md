# Maintenance control plane

Issue [#751](https://github.com/Deen-Bridge/dnb-frontend/issues/751) removes the
browser-local maintenance store. Reads now come from public
`GET /api/admin/maintenance` and writes go to authenticated
`PUT /api/admin/maintenance`. The server derives actor identity and role from
the session; the client never sends an actor object.

The client validates message length and future ETA before mutation, rejects
malformed server state, and disables caching on the public read. Durable state,
ETag/versioning, audit history, multi-instance propagation, and capability
specific fail-open/closed enforcement belong to the backend endpoint. If the
endpoint is unavailable, the UI surfaces the error instead of claiming a local
toggle was persisted.
