/**
 * Admin audit-log service — list, filter, paginate, and append audit entries.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function in this module currently resolves with mocked
 * data so the audit-log viewer (#308) can be built and reviewed before the
 * backend endpoints exist. Each function documents the expected contract it
 * will implement — swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * Audit-log entry shape owned by the backend:
 *
 *   {
 *     id: string,
 *     timestamp: string,                 // ISO 8601 timestamp
 *     actor: { id: string, name: string },
 *     action: string,                    // e.g. "course.published"
 *     category: "user" | "course" | "payment" | "moderation" | "system",
 *     target: { label: string, href: string | null },
 *     summary: string,
 *     ip: string | null,                 // resolved server-side; may be null
 *   }
 *
 * Pagination is **server-side**: `listAuditLogs` filters the full dataset,
 * then returns only the requested `page`/`pageSize` slice alongside the total
 * matching count so the UI can render "Page X of N" without holding every row.
 */

const MOCK_DELAY_MS = 400;

/**
 * Canonical audit categories. Mirrors the `category` union in the entry shape
 * above and the filter options the viewer offers.
 */
export const AUDIT_CATEGORIES = Object.freeze([
  "user",
  "course",
  "payment",
  "moderation",
  "system",
]);

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Minutes → milliseconds, for readable relative mock timestamps. */
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/**
 * A stable base time so the generated timestamps are deterministic within a
 * single module load (avoids the list reshuffling on every re-render/refetch).
 */
const BASE_NOW = Date.now();

/** Actors referenced across the mock dataset. */
const ACTORS = [
  { id: "admin-001", name: "Amina Yusuf" },
  { id: "admin-002", name: "Bilal Karim" },
  { id: "admin-003", name: "Zaynab Idris" },
  { id: "admin-004", name: "Omar Farouk" },
  { id: "admin-005", name: "Layla Hassan" },
];

/**
 * In-module audit dataset. `logAdminAction` appends here so the viewer reflects
 * freshly logged actions during a session; a real backend persists these.
 *
 * Ordered newest-first, matching how the backend is expected to return them.
 *
 * @type {Array<{id: string, timestamp: string, actor: {id: string, name: string}, action: string, category: string, target: {label: string, href: string|null}, summary: string, ip: string|null}>}
 */
const AUDIT_LOGS = [
  {
    id: "log-0001",
    timestamp: new Date(BASE_NOW - 12 * MIN).toISOString(),
    actor: ACTORS[0],
    action: "course.published",
    category: "course",
    target: { label: "Foundations of Tajweed", href: "/dashboard/admin/courses/crs-101" },
    summary: "Published course after final content review.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0002",
    timestamp: new Date(BASE_NOW - 48 * MIN).toISOString(),
    actor: ACTORS[1],
    action: "user.role_changed",
    category: "user",
    target: { label: "hafsa@deenbridge.org", href: "/dashboard/admin/users/usr-882" },
    summary: "Promoted learner to educator role.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0003",
    timestamp: new Date(BASE_NOW - 2 * HOUR).toISOString(),
    actor: ACTORS[2],
    action: "payment.refunded",
    category: "payment",
    target: { label: "Order #DB-49213", href: "/dashboard/admin/payments/DB-49213" },
    summary: "Issued full refund for duplicate charge.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0004",
    timestamp: new Date(BASE_NOW - 3 * HOUR - 20 * MIN).toISOString(),
    actor: ACTORS[3],
    action: "moderation.comment_removed",
    category: "moderation",
    target: { label: "Comment on “Seerah Q&A”", href: "/dashboard/admin/moderation/cmt-7741" },
    summary: "Removed comment reported for harassment.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0005",
    timestamp: new Date(BASE_NOW - 5 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "system.settings_updated",
    category: "system",
    target: { label: "Platform settings", href: "/dashboard/admin/settings" },
    summary: "Enabled maintenance banner for scheduled downtime.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0006",
    timestamp: new Date(BASE_NOW - 7 * HOUR).toISOString(),
    actor: ACTORS[4],
    action: "course.unpublished",
    category: "course",
    target: { label: "Intro to Fiqh (draft)", href: "/dashboard/admin/courses/crs-118" },
    summary: "Unpublished course pending copyright check.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0007",
    timestamp: new Date(BASE_NOW - 9 * HOUR).toISOString(),
    actor: ACTORS[1],
    action: "user.suspended",
    category: "user",
    target: { label: "spam-account-31", href: "/dashboard/admin/users/usr-931" },
    summary: "Suspended account for policy violations.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0008",
    timestamp: new Date(BASE_NOW - 11 * HOUR).toISOString(),
    actor: ACTORS[2],
    action: "payment.payout_approved",
    category: "payment",
    target: { label: "Payout batch #B-204", href: "/dashboard/admin/payments/batch-204" },
    summary: "Approved monthly educator payout batch.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0009",
    timestamp: new Date(BASE_NOW - 14 * HOUR).toISOString(),
    actor: ACTORS[3],
    action: "moderation.report_dismissed",
    category: "moderation",
    target: { label: "Report #R-5521", href: "/dashboard/admin/moderation/R-5521" },
    summary: "Dismissed report after review — no violation found.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0010",
    timestamp: new Date(BASE_NOW - 18 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "system.feature_flag_toggled",
    category: "system",
    target: { label: "flag: live-classes", href: null },
    summary: "Enabled live-classes feature flag for beta cohort.",
    ip: null,
  },
  {
    id: "log-0011",
    timestamp: new Date(BASE_NOW - 22 * HOUR).toISOString(),
    actor: ACTORS[4],
    action: "course.updated",
    category: "course",
    target: { label: "Arabic Alphabet Basics", href: "/dashboard/admin/courses/crs-102" },
    summary: "Reordered lessons and fixed two broken video links.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0012",
    timestamp: new Date(BASE_NOW - DAY - 1 * HOUR).toISOString(),
    actor: ACTORS[1],
    action: "user.role_changed",
    category: "user",
    target: { label: "yusuf@deenbridge.org", href: "/dashboard/admin/users/usr-410" },
    summary: "Granted staff-admin tier.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0013",
    timestamp: new Date(BASE_NOW - DAY - 4 * HOUR).toISOString(),
    actor: ACTORS[2],
    action: "payment.refunded",
    category: "payment",
    target: { label: "Order #DB-48800", href: "/dashboard/admin/payments/DB-48800" },
    summary: "Partial refund issued per support ticket #ST-9912.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0014",
    timestamp: new Date(BASE_NOW - DAY - 6 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "moderation.user_warned",
    category: "moderation",
    target: { label: "learner-7781", href: "/dashboard/admin/users/usr-778" },
    summary: "Issued formal warning for repeated off-topic posts.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0015",
    timestamp: new Date(BASE_NOW - DAY - 9 * HOUR).toISOString(),
    actor: ACTORS[3],
    action: "system.settings_updated",
    category: "system",
    target: { label: "Email templates", href: "/dashboard/admin/settings/email" },
    summary: "Updated welcome-email copy and sender name.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0016",
    timestamp: new Date(BASE_NOW - DAY - 13 * HOUR).toISOString(),
    actor: ACTORS[4],
    action: "course.published",
    category: "course",
    target: { label: "Stories of the Prophets", href: "/dashboard/admin/courses/crs-133" },
    summary: "Published new course to the public catalogue.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0017",
    timestamp: new Date(BASE_NOW - 2 * DAY).toISOString(),
    actor: ACTORS[1],
    action: "user.deleted",
    category: "user",
    target: { label: "bot-signup-55", href: null },
    summary: "Permanently deleted automated spam signup.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0018",
    timestamp: new Date(BASE_NOW - 2 * DAY - 3 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "payment.payout_rejected",
    category: "payment",
    target: { label: "Payout request #P-771", href: "/dashboard/admin/payments/P-771" },
    summary: "Rejected payout — mismatched bank details.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0019",
    timestamp: new Date(BASE_NOW - 2 * DAY - 7 * HOUR).toISOString(),
    actor: ACTORS[2],
    action: "moderation.comment_removed",
    category: "moderation",
    target: { label: "Comment on “Zakat 101”", href: "/dashboard/admin/moderation/cmt-8123" },
    summary: "Removed spam link comment.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0020",
    timestamp: new Date(BASE_NOW - 2 * DAY - 11 * HOUR).toISOString(),
    actor: ACTORS[3],
    action: "system.integration_connected",
    category: "system",
    target: { label: "Cloudinary integration", href: "/dashboard/admin/settings/integrations" },
    summary: "Reconnected media storage after key rotation.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0021",
    timestamp: new Date(BASE_NOW - 3 * DAY).toISOString(),
    actor: ACTORS[4],
    action: "course.updated",
    category: "course",
    target: { label: "Understanding Hadith", href: "/dashboard/admin/courses/crs-140" },
    summary: "Added new assessment quiz to module 3.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0022",
    timestamp: new Date(BASE_NOW - 3 * DAY - 5 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "user.role_changed",
    category: "user",
    target: { label: "aisha@deenbridge.org", href: "/dashboard/admin/users/usr-201" },
    summary: "Revoked educator role at user request.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0023",
    timestamp: new Date(BASE_NOW - 3 * DAY - 10 * HOUR).toISOString(),
    actor: ACTORS[1],
    action: "payment.refunded",
    category: "payment",
    target: { label: "Order #DB-47500", href: "/dashboard/admin/payments/DB-47500" },
    summary: "Refunded after course was unpublished.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0024",
    timestamp: new Date(BASE_NOW - 4 * DAY).toISOString(),
    actor: ACTORS[2],
    action: "moderation.report_escalated",
    category: "moderation",
    target: { label: "Report #R-5490", href: "/dashboard/admin/moderation/R-5490" },
    summary: "Escalated report to super-admin review.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0025",
    timestamp: new Date(BASE_NOW - 4 * DAY - 6 * HOUR).toISOString(),
    actor: ACTORS[3],
    action: "system.settings_updated",
    category: "system",
    target: { label: "Localization settings", href: "/dashboard/admin/settings/locale" },
    summary: "Added Arabic as a supported UI locale.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0026",
    timestamp: new Date(BASE_NOW - 5 * DAY).toISOString(),
    actor: ACTORS[4],
    action: "course.published",
    category: "course",
    target: { label: "Islamic Finance Essentials", href: "/dashboard/admin/courses/crs-151" },
    summary: "Published after pricing approval.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0027",
    timestamp: new Date(BASE_NOW - 5 * DAY - 8 * HOUR).toISOString(),
    actor: ACTORS[0],
    action: "user.suspended",
    category: "user",
    target: { label: "flagged-user-19", href: "/dashboard/admin/users/usr-619" },
    summary: "Temporary suspension pending investigation.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0028",
    timestamp: new Date(BASE_NOW - 6 * DAY).toISOString(),
    actor: ACTORS[1],
    action: "payment.payout_approved",
    category: "payment",
    target: { label: "Payout batch #B-198", href: "/dashboard/admin/payments/batch-198" },
    summary: "Approved payout batch for 42 educators.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0029",
    timestamp: new Date(BASE_NOW - 6 * DAY - 9 * HOUR).toISOString(),
    actor: ACTORS[2],
    action: "moderation.comment_removed",
    category: "moderation",
    target: { label: "Comment on “Ramadan Prep”", href: "/dashboard/admin/moderation/cmt-8544" },
    summary: "Removed comment with external phishing link.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0030",
    timestamp: new Date(BASE_NOW - 7 * DAY).toISOString(),
    actor: ACTORS[3],
    action: "system.feature_flag_toggled",
    category: "system",
    target: { label: "flag: certificate-downloads", href: null },
    summary: "Disabled certificate downloads during template migration.",
    ip: null,
  },
  {
    id: "log-0031",
    timestamp: new Date(BASE_NOW - 7 * DAY - 5 * HOUR).toISOString(),
    actor: ACTORS[4],
    action: "course.unpublished",
    category: "course",
    target: { label: "Advanced Tafsir", href: "/dashboard/admin/courses/crs-160" },
    summary: "Unpublished for content revisions.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0032",
    timestamp: new Date(BASE_NOW - 8 * DAY).toISOString(),
    actor: ACTORS[0],
    action: "user.role_changed",
    category: "user",
    target: { label: "ibrahim@deenbridge.org", href: "/dashboard/admin/users/usr-333" },
    summary: "Promoted to super-admin tier.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0033",
    timestamp: new Date(BASE_NOW - 8 * DAY - 7 * HOUR).toISOString(),
    actor: ACTORS[1],
    action: "payment.refunded",
    category: "payment",
    target: { label: "Order #DB-46011", href: "/dashboard/admin/payments/DB-46011" },
    summary: "Refunded per chargeback resolution.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0034",
    timestamp: new Date(BASE_NOW - 9 * DAY).toISOString(),
    actor: ACTORS[2],
    action: "moderation.user_banned",
    category: "moderation",
    target: { label: "repeat-offender-4", href: "/dashboard/admin/users/usr-704" },
    summary: "Permanent ban after third policy violation.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0035",
    timestamp: new Date(BASE_NOW - 9 * DAY - 6 * HOUR).toISOString(),
    actor: ACTORS[3],
    action: "system.settings_updated",
    category: "system",
    target: { label: "Payment gateway", href: "/dashboard/admin/settings/payments" },
    summary: "Switched default currency to USD.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0036",
    timestamp: new Date(BASE_NOW - 10 * DAY).toISOString(),
    actor: ACTORS[4],
    action: "course.published",
    category: "course",
    target: { label: "Beginner Quran Recitation", href: "/dashboard/admin/courses/crs-170" },
    summary: "Published free introductory course.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0037",
    timestamp: new Date(BASE_NOW - 11 * DAY).toISOString(),
    actor: ACTORS[0],
    action: "user.deleted",
    category: "user",
    target: { label: "duplicate-account-8", href: null },
    summary: "Merged and removed duplicate account.",
    ip: "196.201.214.10",
  },
  {
    id: "log-0038",
    timestamp: new Date(BASE_NOW - 12 * DAY).toISOString(),
    actor: ACTORS[1],
    action: "payment.payout_approved",
    category: "payment",
    target: { label: "Payout batch #B-190", href: "/dashboard/admin/payments/batch-190" },
    summary: "Approved payout batch after reconciliation.",
    ip: "102.89.34.7",
  },
  {
    id: "log-0039",
    timestamp: new Date(BASE_NOW - 13 * DAY).toISOString(),
    actor: ACTORS[2],
    action: "moderation.report_dismissed",
    category: "moderation",
    target: { label: "Report #R-5401", href: "/dashboard/admin/moderation/R-5401" },
    summary: "Dismissed duplicate report.",
    ip: "197.210.53.145",
  },
  {
    id: "log-0040",
    timestamp: new Date(BASE_NOW - 14 * DAY).toISOString(),
    actor: ACTORS[3],
    action: "system.settings_updated",
    category: "system",
    target: { label: "Security settings", href: "/dashboard/admin/settings/security" },
    summary: "Enforced two-factor authentication for all admins.",
    ip: "154.113.28.90",
  },
  {
    id: "log-0041",
    timestamp: new Date(BASE_NOW - 16 * DAY).toISOString(),
    actor: ACTORS[4],
    action: "course.updated",
    category: "course",
    target: { label: "Manners & Etiquette", href: "/dashboard/admin/courses/crs-181" },
    summary: "Refreshed course thumbnail and description.",
    ip: "41.58.102.66",
  },
  {
    id: "log-0042",
    timestamp: new Date(BASE_NOW - 18 * DAY).toISOString(),
    actor: ACTORS[0],
    action: "user.role_changed",
    category: "user",
    target: { label: "khadija@deenbridge.org", href: "/dashboard/admin/users/usr-450" },
    summary: "Granted educator role after application approval.",
    ip: "196.201.214.10",
  },
];

/**
 * Whether an ISO timestamp falls within an inclusive [from, to] date window.
 * `from`/`to` are `YYYY-MM-DD` strings (from the date inputs) or empty/absent.
 * `to` is treated as end-of-day so a same-day from/to still matches.
 */
function withinRange(iso, from, to) {
  const t = new Date(iso).getTime();
  if (from) {
    const fromMs = new Date(`${from}T00:00:00`).getTime();
    if (!Number.isNaN(fromMs) && t < fromMs) return false;
  }
  if (to) {
    const toMs = new Date(`${to}T23:59:59.999`).getTime();
    if (!Number.isNaN(toMs) && t > toMs) return false;
  }
  return true;
}

/**
 * List audit-log entries with server-side filtering + pagination.
 *
 * The mock filters the in-module dataset by `actor`/`category`/date-range,
 * then slices the matching rows to the requested `page`/`pageSize`, returning
 * the correct `total` for the *filtered* set (not the whole dataset).
 *
 * TODO(backend): GET /api/admin/audit-logs?actor=&category=&from=&to=&page=&pageSize=
 *   - Auth: super-admin session token (server-side tier check); 403 otherwise.
 *   - Query params: `actor` (actor id, omit/"" for all), `category` (one of
 *     {@link AUDIT_CATEGORIES}, omit/"all" for all), `from`/`to`
 *     (`YYYY-MM-DD`, inclusive), `page` (1-based), `pageSize`.
 *   - 200 → { logs: Log[], total: number, page: number, pageSize: number }
 *     where `total` is the count of rows matching the filters and `logs` is the
 *     current page slice, newest-first.
 *
 * @param {object} [params]
 * @param {string} [params.actor]     Actor id to filter by; falsy/"all" → all actors.
 * @param {string} [params.category]  Category to filter by; falsy/"all" → all categories.
 * @param {string} [params.from]      Inclusive start date, `YYYY-MM-DD`.
 * @param {string} [params.to]        Inclusive end date, `YYYY-MM-DD`.
 * @param {number} [params.page=1]    1-based page number.
 * @param {number} [params.pageSize=20] Rows per page.
 * @returns {Promise<{logs: Array<object>, total: number, page: number, pageSize: number}>}
 */
export async function listAuditLogs({
  actor,
  category,
  from,
  to,
  page = 1,
  pageSize = 20,
} = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/audit-logs", {
  //       params: { actor, category, from, to, page, pageSize },
  //     })
  //     .then((res) => res.data);
  const filtered = AUDIT_LOGS.filter((log) => {
    if (actor && actor !== "all" && log.actor.id !== actor) return false;
    if (category && category !== "all" && log.category !== category) return false;
    if (!withinRange(log.timestamp, from, to)) return false;
    return true;
  });

  const total = filtered.length;
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || 20);
  const start = (safePage - 1) * safeSize;
  const logs = filtered.slice(start, start + safeSize);

  return withMockDelay({ logs, total, page: safePage, pageSize: safeSize });
}

/**
 * List the distinct actors present in the audit dataset, for the actor filter
 * dropdown. Derived from the dataset so it always matches what can appear.
 *
 * TODO(backend): GET /api/admin/audit-logs/actors
 *   - Auth: super-admin only.
 *   - 200 → { actors: { id: string, name: string }[] }
 *     (backend may instead return the full admin roster; the UI only needs
 *     id + name for the dropdown).
 *
 * @returns {Promise<{actors: Array<{id: string, name: string}>}>}
 */
export async function listActors() {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/audit-logs/actors")
  //     .then((res) => res.data);
  const seen = new Map();
  for (const log of AUDIT_LOGS) {
    if (!seen.has(log.actor.id)) seen.set(log.actor.id, log.actor.name);
  }
  const actors = [...seen.entries()].map(([id, name]) => ({ id, name }));
  return withMockDelay({ actors });
}

/**
 * Append a single audit-log entry. **The core deliverable of #308.**
 *
 * This is the shared helper **every mutating admin flow calls** right after a
 * successful mutation, so that privileged actions (publishing a course,
 * changing a role, refunding a payment, removing a comment, toggling a
 * setting, …) leave a durable, reviewable trail. Centralising it here means the
 * audit contract lives in one place and call sites only describe *what* they
 * did — never *who*, *when*, or *from where*.
 *
 * The caller supplies only `action`, `category`, `target`, and `summary`. The
 * `actor` and `ip` are resolved **server-side from the session** and MUST NOT
 * be trusted from the client — the mock fills a placeholder actor/ip purely so
 * the viewer shows the new row during a session.
 *
 * TODO(backend): POST /api/admin/audit-logs
 *   - Auth: any admin session (staff or super-admin) — the logging endpoint is
 *     broader than the read endpoint; the *viewer* is super-admin gated.
 *   - Body: { action: string, category: Category, target: {label, href|null},
 *             summary: string }
 *   - Server resolves `actor` (from the session user) and `ip` (from the
 *     request) — these are ignored if sent by the client.
 *   - 201 → { log: Log } (the persisted entry, including server-assigned
 *     `id`, `timestamp`, `actor`, and `ip`).
 *
 * @example
 * // Inside an admin flow, after the mutation succeeds:
 * import { logAdminAction } from "@/lib/actions/admin-audit";
 *
 * async function publishCourse(course) {
 *   await updateCourse(course.id, { status: "published" });
 *   // Leave an audit trail for the action just performed.
 *   await logAdminAction({
 *     action: "course.published",
 *     category: "course",
 *     target: { label: course.title, href: `/dashboard/admin/courses/${course.id}` },
 *     summary: `Published “${course.title}” to the public catalogue.`,
 *   });
 * }
 *
 * @param {object} entry
 * @param {string} entry.action    Dot-namespaced action key, e.g. "course.published".
 * @param {("user"|"course"|"payment"|"moderation"|"system")} entry.category
 * @param {{label: string, href: string|null}} entry.target  Human label + optional deep link.
 * @param {string} entry.summary   One-line human summary of what changed.
 * @returns {Promise<{log: object}>} The newly created log entry.
 */
export async function logAdminAction({ action, category, target, summary }) {
  // TODO(backend):
  //   return axiosInstance
  //     .post("/api/admin/audit-logs", { action, category, target, summary })
  //     .then((res) => res.data);
  const log = {
    id: `log-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    // Placeholder actor/ip: the real values are resolved server-side from the
    // session and request. Do not rely on these client-side stand-ins.
    actor: { id: "session", name: "You" },
    action,
    category,
    target: target || { label: "—", href: null },
    summary: summary || "",
    ip: null,
  };
  AUDIT_LOGS.unshift(log);
  return withMockDelay({ log });
}
