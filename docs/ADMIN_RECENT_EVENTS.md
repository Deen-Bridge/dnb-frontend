# Admin recent-events contract

`GET /api/admin/recent-events` is an authenticated, admin-authorized endpoint
used by the admin overview activity widget.

## Request

The client sends `limit`, `cursor`, and optional `since` query parameters.
`limit` is clamped to 1–50 in the client and must be bounded again by the
server. `cursor` is an opaque server-issued cursor. `since` is an ISO-8601
timestamp for incremental polling; the server may ignore it when the cursor is
present.

The endpoint must authenticate the session and authorize an admin role before
reading any event. A non-admin must receive `403`; an unauthenticated request
must receive `401`. The client does not send an actor ID or user-supplied
visibility filter.

## Response

```json
{
  "events": [{
    "id": "evt_123",
    "type": "user_signup",
    "actorId": "user_123",
    "actorName": "Aisha",
    "description": "joined the platform",
    "createdAt": "2026-11-20T12:00:00.000Z"
  }],
  "nextCursor": "opaque-cursor-or-null",
  "generatedAt": "2026-11-20T12:00:01.000Z"
}
```

Supported event types are `user_signup`, `course_published`, `payment`,
`report`, and `verification`. The server returns newest-first ordering. Event
IDs are stable and unique, allowing the client to deduplicate retries and
overlapping time windows.

## Privacy and retention

Events contain only the minimum display fields above. Do not include email
addresses, wallet addresses, payment details, report bodies, verification
documents, tokens, or arbitrary metadata. `actorName` is the display name and
`actorId` is used only for the existing admin user-detail link. The backend
owns retention and must apply the platform audit-retention policy; the client
does not persist events beyond the rendered page.

## Client states and polling

The widget polls every 30 seconds only while the document is visible. A
request in flight prevents another request from starting; hiding the document
aborts the request and stops the timer. An empty successful response shows
“No recent activity yet.” A `401`/`403`, timeout, network failure, or `5xx`
shows an unavailable error instead of pretending the feed is empty.
