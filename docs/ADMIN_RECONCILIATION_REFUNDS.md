# Production reconciliation and refunds

The dashboard uses the authenticated Stellar payment APIs. It does not seed
financial rows in the browser.

## State model

Reconciliation joins an internal completed transaction to a provider claim by
transaction hash:

| State | Meaning |
| --- | --- |
| `matched` | Provider and ledger are settled and amount/currency agree. |
| `missing-on-chain` | No provider claim exists for the internal transaction. |
| `amount-mismatch` | A claim exists, but amount or currency differs. |
| `pending` | A provider or ledger result is present but not final. |

Unknown provider or ledger values are deliberately `pending`; they are never
shown as settled. The status request is deterministic: it sends the selected
UTC date range, `page=1`, and `pageSize=100` to
`GET /api/stellar/payment/reconciliation/status`.

Refunds use `GET /api/stellar/payment/refunds`. A failed retry is sent to
`POST /api/stellar/payment/refunds/:refundId/retry` with a stable
`Idempotency-Key` derived from the refund ID. The server response replaces the
local row, so an unknown provider response remains `pending` and a duplicate
click cannot create a second retry operation.

Both endpoints are authenticated by the shared Axios client, which refreshes
the session when required. Permission failures and transport errors remain in
the existing page error states.
