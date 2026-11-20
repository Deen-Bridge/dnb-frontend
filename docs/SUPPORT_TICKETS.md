# Support ticket contract

The account support page uses `/api/support/tickets`, a same-origin server-side
proxy. The proxy forwards the authenticated `authToken` cookie and never accepts
a user id from the browser. The backend is the authority for ticket ownership,
the durable id, status, attachment storage, and notifications.

## API

- `POST /api/support/tickets` accepts multipart `subject`, `description`, and an
  optional `attachment`. It requires an `Idempotency-Key` and returns
  `{ ticket: { id, status, createdAt, updatedAt } }`.
- `GET /api/support/tickets` returns only the authenticated user's tickets.
- Valid statuses are `open`, `in_progress`, `waiting_on_customer`, `resolved`,
  and `closed`. The client displays the returned status and never fabricates a
  successful ticket or transition.

The backend must atomically reuse the original response for a repeated
idempotency key, scoped to the authenticated user, and reject a key reused with
different content. This prevents retries and double-clicks from creating
duplicates.

## Attachment threat model

The proxy limits files to 10 MiB and a small allowlist of image/PDF/text MIME
types. The backend must inspect bytes rather than trusting the browser MIME type,
scan before making an attachment available, store it outside the public web
root, and issue short-lived, owner-checked signed URLs. Failed scans must reject
the ticket or leave the attachment unavailable; the ticket must not claim that
an upload succeeded. Signed URLs should expire within 15 minutes and records
should retain only the attachment metadata needed for the support SLA.

## State and retention

Only the backend may transition a ticket. Suggested transitions are
`open -> in_progress -> waiting_on_customer -> resolved -> closed`, with a
support-authorized reopen from `resolved` or `closed`. Each transition should
be audited, notify the owner, and preserve timestamps. Delete attachment bytes
and personal content according to the configured retention policy; deletion
must be authenticated and audited.

Staging release evidence should include traces for a successful create, a
malware/attachment rejection, an upstream outage, an idempotent retry, and an
unauthorized ticket read.
