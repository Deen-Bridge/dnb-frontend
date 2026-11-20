# Mobile notification contract

Issue [#743](https://github.com/Deen-Bridge/dnb-frontend/issues/743) aligns the
mobile client with the backend notification routes. The bulk mutation is
`PUT /api/notifications/mark-all-read`; the legacy `/read-all` path is not
used. Single-item reads use `PUT /api/notifications/:id/read`, and deletion is
reserved as `DELETE /api/notifications/:id` for the next UI action.

The screen distinguishes loading, empty, unauthorized, and retryable failure
states. Mutations are sent through the authenticated Axios client, so its
refresh queue handles expired sessions without duplicating a mark-read action.
English and Arabic copy share the same keys and all actions expose accessible
labels.
