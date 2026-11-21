# Admin user activity timeline

The admin user detail page reads `GET /api/admin/users/:userId/activity` through the authenticated Axios client. The backend endpoint is the source of truth; the browser does not merge user-record hints, transactions, verification records, or mock data.

## Response contract

```json
{
  "success": true,
  "snapshot": "opaque-snapshot-id",
  "events": [{
    "id": "immutable-event-id",
    "type": "purchase",
    "title": "Purchased …",
    "detail": "optional redacted detail",
    "actor": "optional redacted actor",
    "timestamp": "2026-11-20T12:00:00.000Z",
    "timestampSemantics": "occurred_at",
    "provenance": "payments.transaction"
  }],
  "nextCursor": "opaque-cursor-or-null",
  "degraded": [{ "source": "verification", "reason": "temporarily unavailable" }]
}
```

The endpoint must authenticate the request and authorize the caller as an admin before resolving `userId`. `snapshot` must remain stable across cursor requests; the server must reject a cursor from a different snapshot rather than silently mixing versions. Events are ordered newest first, deduplicated by immutable `id`, and filtered by retention/account-deletion policy before serialization.

The frontend rejects entries without an immutable id, valid ISO timestamp, provenance, and timestamp semantics. It renders a clear unavailable state for endpoint failures and reports server-provided degraded sources without substituting client or mock records. Sensitive credentials, tokens, payment payloads, and unrelated user fields must never be included in the response.
