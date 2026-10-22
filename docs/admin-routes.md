# Admin route map

This inventory records the route files currently present under `app/[locale]/admin/` and the data wiring visible in this frontend checkout. “Wired” means the route uses an API-backed helper in source; it does not guarantee the endpoint is deployed or verify the response at runtime. “Mock”, “stub”, and “unverified” routes need the linked wiring issue or a follow-up issue before being treated as live. Recheck this table as routes and backend contracts change.

| Route | Purpose | Current status | Endpoint or tracking issue |
| --- | --- | --- | --- |
| `/admin` | Admin overview and metrics | Stub | Admin overview helper returns demo data; #500 |
| `/admin/activity-monitor` | System activity and emergency-stop controls | UI-only / unverified | No concrete data endpoint found in page; #500 |
| `/admin/analytics/funnel` | Funnel analytics | Mock | #500 |
| `/admin/analytics/learning` | Learning engagement analytics | Stub | `lib/actions/admin-learning-analytics.ts`; replace demo response under #500 |
| `/admin/analytics/revenue` | Revenue analytics | Stub | Revenue report endpoint `/api/stellar/reports`; #477 |
| `/admin/analytics/search` | Search analytics | Stub | Helper documents intended `/api/admin/analytics/search`; issue #483 specifies `/api/analytics/search` |
| `/admin/announcements` | Create and manage announcements | Stub + local draft | Drafts use localStorage; admin announcement action is mock-backed; #500 |
| `/admin/announcements/history` | Announcement send history | Stub / unverified | Component has no verified endpoint wiring; #500 |
| `/admin/audit-log` | Audit log (duplicate route) | Mock | Duplicate of `/admin/audit-logs`; canonical route planned by #482; duplicate tracked in #494 |
| `/admin/audit-logs` | Audit logs with filters | Mock | GET `/api/admin/audit`; wiring + canonical route in #482; duplicate tracked in #494 |
| `/admin/books` | Books catalog moderation | Mock | #500 |
| `/admin/books/approval-queue` | Book approval queue | Mock | #500 |
| `/admin/books/import` | Bulk book import | Stub / unverified | No persisted API endpoint found in page; #500 |
| `/admin/categories` | Course category CRUD | Mock | `/api/categories` (POST/PATCH/DELETE); #481 |
| `/admin/courses` | Course catalog moderation | Wired | `GET /api/courses`; `lib/actions/courses/fetch-courses.ts` |
| `/admin/courses/[courseId]` | Course detail and moderation | Wired | `GET /api/courses/:courseId`; `lib/actions/courses/get-course.ts` |
| `/admin/educators` | Educator directory and verification queue | Mixed: API + mock fallback | `/api/admin/educators/verifications` in `lib/actions/admin-verifications.ts`; endpoint correction / queue wiring tracked by #484 |
| `/admin/emails` | Compose and send admin email | Stub | `lib/actions/admin-emails.ts` returns mock data; #500 |
| `/admin/forbidden` | Access-denied explanation | UI-only | No backing data endpoint required |
| `/admin/payments/disputes` | Payment dispute review | Mock | See #496 for dispute external-URL work; remove mock data under #500 |
| `/admin/privacy` | Privacy export and deletion requests | Mock + partial download | Export download URL appears in page; request lists remain mock; #500 |
| `/admin/reconciliation` | Payment reconciliation | Mock | GET `/api/stellar/payment/reconciliation/status`; #478 |
| `/admin/reels` | Reel moderation | Mixed: API + unverified list source | `/api/admin/reels/:reelId/visibility` via `lib/actions/reels-action.ts`; verify list source |
| `/admin/reports` | User/content reports | Mock | Mock report generator in page; #500 |
| `/admin/reports/reasons` | Report reason management | Unverified / likely mock | No endpoint found in route component; #500 |
| `/admin/settings` | Admin settings index | UI-only | Navigation page; no backing data endpoint required |
| `/admin/settings/branding` | Brand settings | Unverified / stub | No endpoint found in route component; #500 |
| `/admin/settings/capacity` | Capacity settings | Unverified / stub | No endpoint found in route component; #500 |
| `/admin/settings/flags` | Feature flag settings | Unverified / stub | No endpoint found in route component; #500 |
| `/admin/settings/integrations` | Integration keys and webhooks | Mock | Starts from mock keys/webhooks; #500 |
| `/admin/settings/policies` | Policy settings | Unverified / stub | No endpoint found in route component; #500 |
| `/admin/settings/preferences` | Admin preferences | Mixed / verify backend | Uses `hooks/useAdminPreferences`; endpoint not identified in this route audit |
| `/admin/spaces` | Community space moderation | Mock | #500 |
| `/admin/spaces/recordings` | Space recordings | Mock | `GET /api/spaces/:spaceId/recordings`; #480 |
| `/admin/transactions` | Transaction explorer | Unverified / partial | Uses `components/admin/GlobalTransactionExplorer`; endpoint not established in route page |
| `/admin/users` | User management and credential expiry | Mixed: API + unverified list source | `GET /api/admin/mentors/credentials` via `lib/actions/admin-credential-expiry.ts`; other list wiring needs confirmation |
| `/admin/users/[userId]` | User detail and role/verification history | Wired | `GET /api/users/:userId`; verification history helper requests `/api/admin/educators/:educatorId/verification-history` |
| `/admin/verification` | Educator verification SLA board (duplicate) | Mock | Uses `mockVerificationQueue`; tracked by #484; duplicate route tracked by #495 |
| `/admin/verifications` | Educator verification queue (duplicate) | Mixed: API + mock fallback | Re-exports `/admin/educators`; endpoint correction/wiring #484; duplicate tracked by #495 |

## Known duplicate routes

- `/admin/audit-log` and `/admin/audit-logs` overlap; #494 tracks consolidation and #482 tracks the canonical API-backed route.
- `/admin/verification` and `/admin/verifications` overlap; #495 tracks consolidation and #484 tracks the real verification queue/SLA API.

## Related wiring work

| Issue | Area | Expected backend contract |
| --- | --- | --- |
| #477 | Revenue analytics | `/api/stellar/reports` |
| #478 | Reconciliation | `GET /api/stellar/payment/reconciliation/status` |
| #479 | Refund register | `/api/stellar/payment/refunds/*` (no dedicated refunds route was found in this route inventory) |
| #480 | Space recordings | `GET /api/spaces/:spaceId/recordings` |
| #481 | Categories | `/api/categories` admin CRUD |
| #482 | Audit log | `GET /api/admin/audit` and duplicate route consolidation |
| #483 | Search analytics | `GET /api/analytics/search` |
| #484 | Educator verification | `/api/admin/educator-verification` |
| #494 | Audit route duplication | Consolidate `/admin/audit-log` and `/admin/audit-logs` |
| #495 | Verification route duplication | Consolidate `/admin/verification` and `/admin/verifications` |
| #500 | Mock cleanup umbrella | Remove mock generators as individual routes are wired |

Status is based on a source review of the route components and their imported data helpers; rows marked “unverified” are intentionally conservative.
