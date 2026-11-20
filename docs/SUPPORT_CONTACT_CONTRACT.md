# Support contact contract

The public contact form submits to the same-origin `POST /api/contact` route.
The route forwards a minimal payload to the provider configured by the server-only
`SUPPORT_CONTACT_WEBHOOK_URL` environment variable. No provider URL, secret, or
message body is exposed to the browser.

The payload contains `requestId`, `name`, `email`, `topic`, and `message`. A
successful provider response returns HTTP 202 with `{ status: "received" }` and
the request ID. Provider failures are returned as a truthful 502/503 response,
and the UI offers a mailto fallback without claiming the request was delivered.

The route validates field lengths and email syntax, rejects the honeypot field,
limits each client key to three requests per minute, and supports an
`Idempotency-Key` header to prevent duplicate submissions. It does not log
request content. The provider must apply its own authenticated delivery,
retention, access-control, and abuse policies.
