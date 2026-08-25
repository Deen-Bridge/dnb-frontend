# Admin audit logging (`lib/admin/audit.js`)

A standardized, **non-blocking (fire-and-forget)** wrapper every admin mutation
flow calls right after a privileged action succeeds. A logging failure can
**never** break or block the triggering UI: errors are swallowed and reported
to the console with the structured event.

## API

```js
import { logAuditEvent, withAudit, AUDIT_ACTIONS } from "@/lib/admin/audit";
```

- **`AUDIT_ACTIONS`** — frozen map of typed action constants (use these instead
  of freeform strings). Unknown actions are warned about but still logged.
- **`logAuditEvent({ action, target, metadata, summary })`** — fire-and-forget.
  Returns `void`; **do not `await` it** in your critical path. Resolves the
  actor client-side (best-effort hint; the backend re-resolves authoritatively),
  derives the category, and POSTs in the background.
- **`withAudit(action, target, mutationFn, metadata?)`** — one-liner helper:
  runs `mutationFn`, and only if it resolves fires the audit event, returning
  the mutation's result. `target` may be a descriptor or `(result) => descriptor`.

`target` accepts a bare label string or `{ label, name, href, id, type }`.

Backend contract (delegated via `lib/actions/admin-audit.js`):
`TODO(backend): POST /api/admin/audit-logs` — body `{ action, category, target:{label,href}, summary }`; the server resolves `actor` + `ip` from the session/request and ignores any client-supplied values.

## Flows that emit audit events

| # | Flow | Action constant | Call site |
|---|------|-----------------|-----------|
| 1 | Role change — demote | `ROLE_DEMOTE` | `hooks/useAdminTeam.js` (`demoteMember`) |
| 2 | Role change — revoke | `ROLE_REVOKE` | `hooks/useAdminTeam.js` (`revokeMember`) |
| 3 | User ban | `BAN` | `lib/actions/admin-users.js` (`banUser`) |
| 4 | Content takedown | `TAKEDOWN` | `lib/actions/admin-moderation.js` (`takedownContent`) |
| 5 | Payment refund | `REFUND` | `lib/actions/admin-payments.js` (`refundPayment`, via `withAudit`) |
| 6 | Broadcast send | `BROADCAST` | `lib/actions/admin-broadcast.js` (`sendBroadcast`) |
| 7 | Feature-flag toggle | `FLAG_TOGGLE` | `hooks/useFeatureFlags.js` (`toggleFlag`) |

> Flows 3–6 ship as **stubbed** actions (`TODO(backend)` mocks) so the audit
> integration is demonstrable before those backends exist.

## Adding a new flow

1. Add a typed constant to `AUDIT_ACTIONS` in `lib/admin/audit.js` and map it to
   a category in `ACTION_CATEGORY` (falls back to `"system"` if omitted).
2. After the mutation **succeeds**, call `logAuditEvent(...)` (or wrap the
   mutation in `withAudit(...)`). Never `await` the audit call.
3. Add a row to the table above.

```js
// After the mutation succeeds:
logAuditEvent({
  action: AUDIT_ACTIONS.BAN,
  target: { label: user.email, id: user.id, href: `/dashboard/admin/users/${user.id}` },
  metadata: { reason },
});
```
