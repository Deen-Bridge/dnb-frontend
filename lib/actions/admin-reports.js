/**
 * Admin report-builder service — datasets, preview rows, saved queries (#329).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Composes the custom report builder from the existing pieces the
 * issue scopes it to: the three datasets (users / transactions / reports),
 * each with its own filter set and column list. There is deliberately **no**
 * cross-dataset join, no custom SQL, and no scheduling — the builder only
 * composes existing filters and columns.
 *
 * Saved queries persist per admin user to `localStorage` (`dnb_admin_saved_queries_<userId>`)
 * so the sidebar round-trips today. Swap for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands:
 *
 *   TODO(backend): GET    /api/admin/saved-queries
 *   TODO(backend): POST   /api/admin/saved-queries   { name, datasetId, filters, columns }
 *   TODO(backend): DELETE /api/admin/saved-queries/:id
 *   TODO(backend): GET    /api/admin/report-rows?dataset=&filters...
 *
 * Saved query shape owned by the backend:
 *   { id: string, name: string, datasetId: "users"|"transactions"|"reports",
 *     filters: object, columns: string[], createdAt: string }
 */

const SAVED_QUERIES_PREFIX = "dnb_admin_saved_queries_";

/** The three report datasets and their filter/column definitions. */
export const REPORT_DATASETS = Object.freeze([
  {
    id: "users",
    label: "Users",
    description: "Platform user accounts",
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "banned", label: "Banned" },
        ],
      },
      { key: "from", label: "Joined from", type: "date" },
      { key: "to", label: "Joined to", type: "date" },
    ],
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" },
      { key: "joinedAt", label: "Joined" },
    ],
    dateColumn: "joinedAt",
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "Purchase and payment transactions",
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending" },
          { value: "submitted", label: "Submitted" },
          { value: "failed", label: "Failed" },
          { value: "expired", label: "Expired" },
        ],
      },
      {
        key: "itemType",
        label: "Item type",
        type: "select",
        options: [
          { value: "all", label: "All types" },
          { value: "course", label: "Course" },
          { value: "book", label: "Book" },
        ],
      },
      { key: "from", label: "Date from", type: "date" },
      { key: "to", label: "Date to", type: "date" },
    ],
    columns: [
      { key: "id", label: "Reference" },
      { key: "createdAt", label: "Date" },
      { key: "itemType", label: "Item type" },
      { key: "itemTitle", label: "Item" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "buyer", label: "Buyer" },
    ],
    dateColumn: "createdAt",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Content moderation reports",
    filters: [
      {
        key: "contentType",
        label: "Content type",
        type: "select",
        options: [
          { value: "all", label: "All content" },
          { value: "course", label: "Course" },
          { value: "book", label: "Book" },
          { value: "space", label: "Space" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "open", label: "Open" },
          { value: "investigating", label: "Investigating" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ],
      },
      { key: "from", label: "Reported from", type: "date" },
      { key: "to", label: "Reported to", type: "date" },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "createdAt", label: "Reported" },
      { key: "contentType", label: "Content type" },
      { key: "itemTitle", label: "Item" },
      { key: "reason", label: "Reason" },
      { key: "status", label: "Status" },
      { key: "reportedBy", label: "Reported by" },
    ],
    dateColumn: "createdAt",
  },
]);

/** Fixed sample rows per dataset so previews are deterministic and filterable. */
const SAMPLE_ROWS = Object.freeze({
  users: [
    { name: "Amina Yusuf", email: "amina@deenbridge.org", role: "student", status: "active", joinedAt: "2025-01-12" },
    { name: "Bilal Karim", email: "bilal@deenbridge.org", role: "educator", status: "active", joinedAt: "2025-02-03" },
    { name: "Zaynab Idris", email: "zaynab@deenbridge.org", role: "student", status: "banned", joinedAt: "2025-03-17" },
    { name: "Umar Farouk", email: "umar@deenbridge.org", role: "student", status: "active", joinedAt: "2025-04-21" },
    { name: "Khadija Bello", email: "khadija@deenbridge.org", role: "educator", status: "active", joinedAt: "2025-05-09" },
  ],
  transactions: [
    { id: "TX-1001", createdAt: "2025-06-01", itemType: "course", itemTitle: "Tafsir of Surah Al-Fatihah", amount: 24.5, status: "confirmed", buyer: "amina@deenbridge.org" },
    { id: "TX-1002", createdAt: "2025-06-05", itemType: "book", itemTitle: "The Sealed Nectar", amount: 9.99, status: "pending", buyer: "umar@deenbridge.org" },
    { id: "TX-1003", createdAt: "2025-06-08", itemType: "course", itemTitle: "Arabic Grammar Essentials", amount: 35.0, status: "confirmed", buyer: "zaynab@deenbridge.org" },
    { id: "TX-1004", createdAt: "2025-06-12", itemType: "book", itemTitle: "Stories of the Prophets", amount: 7.5, status: "failed", buyer: "khadija@deenbridge.org" },
    { id: "TX-1005", createdAt: "2025-06-15", itemType: "course", itemTitle: "Fiqh of Worship", amount: 42.0, status: "confirmed", buyer: "bilal@deenbridge.org" },
  ],
  reports: [
    { id: "REP-201", createdAt: "2025-06-02", contentType: "course", itemTitle: "Tafsir of Surah Al-Fatihah", reason: "copyright", status: "open", reportedBy: "umar@deenbridge.org" },
    { id: "REP-202", createdAt: "2025-06-06", contentType: "book", itemTitle: "The Sealed Nectar", reason: "spam", status: "investigating", reportedBy: "amina@deenbridge.org" },
    { id: "REP-203", createdAt: "2025-06-09", contentType: "space", itemTitle: "Evening Dhikr Circle", reason: "inappropriate", status: "resolved", reportedBy: "zaynab@deenbridge.org" },
    { id: "REP-204", createdAt: "2025-06-13", contentType: "book", itemTitle: "Stories of the Prophets", reason: "duplicate", status: "dismissed", reportedBy: "bilal@deenbridge.org" },
    { id: "REP-205", createdAt: "2025-06-16", contentType: "course", itemTitle: "Fiqh of Worship", reason: "other", status: "open", reportedBy: "khadija@deenbridge.org" },
  ],
});

function getDataset(datasetId) {
  return REPORT_DATASETS.find((dataset) => dataset.id === datasetId);
}

/**
 * Build the default (empty) filter object for a dataset.
 *
 * @param {string} datasetId
 * @returns {Record<string, string>}
 */
export function defaultFiltersFor(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return {};
  const defaults = {};
  for (const filter of dataset.filters) {
    defaults[filter.key] = filter.type === "select" ? "all" : "";
  }
  return defaults;
}

function isInDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = String(value ?? "").slice(0, 10);
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

/**
 * Fetch preview rows for a dataset, applying the composed filters. Only the
 * dataset's own filters are honored — no joins across datasets.
 *
 * TODO(backend): GET /api/admin/report-rows?dataset=<id>&<filters...>
 *   - Auth: admin only.
 *   - 200 → { rows: Array<Record<string, unknown>> }
 *   - 403 for non-admins; 422 for an unknown dataset id.
 *
 * @param {string} datasetId
 * @param {Record<string, string>} [filters]
 * @param {{limit?: number}} [options]
 * @returns {Promise<{rows: Array<Record<string, unknown>>}>}
 */
export async function fetchReportRows(datasetId, filters = {}, options = {}) {
  const dataset = getDataset(datasetId);
  if (!dataset) {
    throw new Error(`Unknown report dataset: ${datasetId}`);
  }

  let rows = SAMPLE_ROWS[datasetId] || [];

  for (const filter of dataset.filters) {
    const value = filters[filter.key];
    if (!value || value === "all") continue;

    if (filter.type === "date") {
      const { from, to } = filters;
      rows = rows.filter((row) => isInDateRange(row[dataset.dateColumn], from, to));
    } else {
      rows = rows.filter((row) => row[filter.key] === value);
    }
  }

  const limit = options.limit || rows.length;
  return Promise.resolve({ rows: rows.slice(0, limit) });
}

function readSavedQueries(userId) {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = window.localStorage.getItem(`${SAVED_QUERIES_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedQueries(userId, queries) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(
      `${SAVED_QUERIES_PREFIX}${userId}`,
      JSON.stringify(queries)
    );
  } catch {
    // Storage unavailable (private mode / quota) — saving silently no-ops.
  }
}

function generateQueryId() {
  return `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * List the current admin's saved queries (newest first).
 *
 * TODO(backend): GET /api/admin/saved-queries
 *   - Auth: admin only.
 *   - 200 → { queries: SavedQuery[] }
 *
 * @param {string} userId
 * @returns {Promise<{queries: Array<object>}>}
 */
export async function listSavedQueries(userId) {
  return Promise.resolve({ queries: readSavedQueries(userId) });
}

/**
 * Save a named query for the current admin. Requires a non-empty name, a known
 * dataset, and at least one selected column.
 *
 * TODO(backend): POST /api/admin/saved-queries
 *   - Auth: admin only.
 *   - Payload: { name, datasetId, filters, columns }
 *   - 201 → { query: SavedQuery }
 *   - 422 for a missing name / unknown dataset / empty columns.
 *
 * @param {string} userId
 * @param {{name: string, datasetId: string, filters: object, columns: string[]}} payload
 * @returns {Promise<{query: object}>}
 */
export async function saveQuery(userId, payload) {
  const name = String(payload?.name || "").trim();
  const datasetId = payload?.datasetId;
  const columns = Array.isArray(payload?.columns) ? payload.columns : [];
  if (!name) {
    throw new Error("A query name is required.");
  }
  if (!getDataset(datasetId)) {
    throw new Error(`Unknown report dataset: ${datasetId}`);
  }
  if (columns.length === 0) {
    throw new Error("Select at least one column.");
  }

  const query = {
    id: generateQueryId(),
    name,
    datasetId,
    filters: { ...(payload.filters || {}) },
    columns,
    createdAt: new Date().toISOString(),
  };

  const queries = readSavedQueries(userId);
  queries.unshift(query);
  writeSavedQueries(userId, queries);

  return Promise.resolve({ query });
}

/**
 * Delete a saved query owned by the current admin.
 *
 * TODO(backend): DELETE /api/admin/saved-queries/:id
 *   - Auth: admin only; queries are scoped per admin.
 *   - 200 → { deleted: true, queryId: string }
 *
 * @param {string} userId
 * @param {string} queryId
 * @returns {Promise<{deleted: boolean, queryId: string}>}
 */
export async function deleteSavedQuery(userId, queryId) {
  const queries = readSavedQueries(userId).filter((query) => query.id !== queryId);
  writeSavedQueries(userId, queries);
  return Promise.resolve({ deleted: true, queryId });
 * Admin moderation-reports service — list, read, and act on user reports.
 * ---------------------------------------------------------------------------
 * **STUBBED (#289).** The moderation-reports backend does not exist yet, so
 * this module serves deterministic in-memory seed data and mocks the mutations,
 * backed by a module-level store so the reports list and the detail drawer stay
 * in sync within a browser session (until a full reload re-seeds the module).
 * Swap the mock bodies for `axiosInstance` calls (see `lib/config/axios.config.js`)
 * when the backend lands.
 *
 * A report ties a **reporter** (who flagged something) to a **target** — a
 * piece of content (reel / book / course) or the account that owns it — plus
 * the context a moderator needs to decide well: the reporter's statement and
 * trust signals (account age, how many prior reports they've filed), and the
 * target's own history (prior reports against it, prior admin actions taken).
 *
 * Report shape owned by the backend:
 *
 *   {
 *     id: string,
 *     status: "open" | "escalated" | "dismissed" | "actioned",
 *     reason: string,                       // short reason code/label
 *     createdAt: string,                    // ISO 8601
 *     reporter: {
 *       id, name, avatar,
 *       accountCreatedAt: string,           // ISO — drives "account age"
 *       priorReportCount: number,           // serial-reporter signal
 *       statement: string,                  // free-text why-they-reported
 *     },
 *     target: {
 *       type: "reel" | "book" | "course",
 *       id, title, author,
 *       preview: { thumbnail?, cover?, poster?, ... },  // type-specific
 *       ownerId, ownerName,
 *       priorReports: Array<{ id, reason, createdAt, status }>,
 *       priorActions: Array<{ id, action, at, by }>,     // admin actions
 *     },
 *   }
 *
 * TODO(backend):
 *   - GET  /api/admin/reports                → 200 { reports: Report[] }         (admin session)
 *   - GET  /api/admin/reports/:id            → 200 { report: Report } | 404
 *   - POST /api/admin/reports/:id/escalate   → 200 { report } (status→escalated)
 *   - POST /api/admin/reports/:id/dismiss    → 200 { report } (status→dismissed)
 *   - POST /api/admin/reports/:id/action     → 200 { report } (status→actioned)
 *       Payload: { action: "takedown" | "ban" | ..., reason?: string }
 *     All are super-admin only (server-side tier check).
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Deterministic seed. Fixed ids and timestamps so the list, the drawer, and any
 * test render identically every time (no randomness). Covers all three target
 * content types the issue calls out: a reel, a book, and a course.
 *
 * @returns {Array<object>}
 */
function seedReports() {
  return [
    {
      id: "rep_1001",
      status: "open",
      reason: "Inappropriate content",
      createdAt: "2026-08-20T09:12:00.000Z",
      reporter: {
        id: "usr_5001",
        name: "Aisha Bello",
        avatar: "https://picsum.photos/seed/reporter-aisha/64/64",
        accountCreatedAt: "2023-02-14T00:00:00.000Z",
        priorReportCount: 2,
        statement:
          "This reel shows content that doesn't align with the community guidelines. The audio contains music over a naat which many members find inappropriate.",
      },
      target: {
        type: "reel",
        id: "reel_88",
        title: "Evening Dhikr — 60s reel",
        author: "Yusuf Adeyemi",
        preview: {
          thumbnail: "https://picsum.photos/seed/reel-88/640/360",
          poster: "https://picsum.photos/seed/reel-88/640/360",
          durationSeconds: 62,
        },
        ownerId: "usr_7001",
        ownerName: "Yusuf Adeyemi",
        priorReports: [
          { id: "rep_0900", reason: "Copyright (audio)", createdAt: "2026-07-30T14:00:00.000Z", status: "dismissed" },
        ],
        priorActions: [],
      },
    },
    {
      id: "rep_1002",
      status: "open",
      reason: "Copyright violation",
      createdAt: "2026-08-21T16:45:00.000Z",
      reporter: {
        id: "usr_5002",
        name: "Ibrahim Sanni",
        avatar: "https://picsum.photos/seed/reporter-ibrahim/64/64",
        accountCreatedAt: "2025-11-01T00:00:00.000Z",
        priorReportCount: 11,
        statement:
          "The uploaded book PDF is a scanned copy of a work still under copyright. The publisher's watermark is visible on several pages.",
      },
      target: {
        type: "book",
        id: "book_42",
        title: "Riyad as-Salihin (annotated)",
        author: "Imam an-Nawawi",
        preview: {
          cover: "https://picsum.photos/seed/book-42/320/440",
        },
        ownerId: "usr_7002",
        ownerName: "Al-Furqan Publishers",
        priorReports: [
          { id: "rep_0811", reason: "Copyright violation", createdAt: "2026-06-11T10:00:00.000Z", status: "actioned" },
          { id: "rep_0655", reason: "Low-quality scan", createdAt: "2026-05-02T08:30:00.000Z", status: "dismissed" },
        ],
        priorActions: [
          { id: "act_311", action: "content.takedown", at: "2026-06-12T09:00:00.000Z", by: "Admin (Khadija)" },
          { id: "act_312", action: "content.restore", at: "2026-06-20T09:00:00.000Z", by: "Admin (Khadija)" },
        ],
      },
    },
    {
      id: "rep_1003",
      status: "open",
      reason: "Misleading information",
      createdAt: "2026-08-22T11:05:00.000Z",
      reporter: {
        id: "usr_5003",
        name: "Fatima Yusuf",
        avatar: "https://picsum.photos/seed/reporter-fatima/64/64",
        accountCreatedAt: "2024-09-19T00:00:00.000Z",
        priorReportCount: 0,
        statement:
          "The course description promises an 'ijazah on completion' which the instructor is not authorized to grant. This could mislead new students.",
      },
      target: {
        type: "course",
        id: "course_17",
        title: "Tajwid Foundations — 8 week intensive",
        author: "Ustadh Kareem",
        preview: {
          thumbnail: "https://picsum.photos/seed/course-17/640/360",
          lessons: 24,
          enrolled: 512,
        },
        ownerId: "usr_7003",
        ownerName: "Ustadh Kareem",
        priorReports: [],
        priorActions: [],
      },
    },
  ];
}

/**
 * In-memory store, seeded lazily on first access so mutations round-trip within
 * a session.
 *
 * @type {Array<object>|null}
 */
let mockReports = null;

function getStore() {
  if (!mockReports) mockReports = seedReports();
  return mockReports;
}

/** Deep-ish clone so callers can't mutate the store by reference. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * List reports (newest first). Defaults to the moderation queue (open +
 * escalated); pass `{ status: "all" }` to include resolved ones.
 *
 * @param {{ status?: "open" | "queue" | "all" }} [opts]
 * @returns {Promise<{ reports: Array<object> }>}
 */
export async function listReports({ status = "queue" } = {}) {
  const all = clone(getStore());
  const filtered =
    status === "all"
      ? all
      : status === "open"
        ? all.filter((r) => r.status === "open")
        : all.filter((r) => r.status === "open" || r.status === "escalated");

  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return withMockDelay({ reports: filtered });
}

/**
 * Fetch a single report with its full context, or `null` if not found.
 *
 * @param {string} id
 * @returns {Promise<{ report: object | null }>}
 */
export async function getReport(id) {
  const found = getStore().find((r) => r.id === id) || null;
  return withMockDelay({ report: found ? clone(found) : null });
}

/** Mutate the stored report's status, or no-op if missing. Returns the clone. */
function setStatus(id, nextStatus) {
  const report = getStore().find((r) => r.id === id);
  if (report) report.status = nextStatus;
  return report ? clone(report) : null;
}

/**
 * Escalate a report for senior review, then emit a non-blocking audit event.
 *
 * @param {string} id
 * @returns {Promise<{ report: object | null }>}
 */
export async function escalateReport(id) {
  const report = setStatus(id, "escalated");
  const result = await withMockDelay({ report });
  if (report) {
    logAuditEvent({
      action: AUDIT_ACTIONS.REPORT_ESCALATE,
      target: { label: `Report ${id}`, href: `/dashboard/admin/reports?report=${id}` },
      metadata: { reportId: id, targetType: report.target?.type, targetId: report.target?.id },
    });
  }
  return result;
}

/**
 * Dismiss a report as no-action, then emit a non-blocking audit event.
 *
 * @param {string} id
 * @param {{ reason?: string }} [opts]
 * @returns {Promise<{ report: object | null }>}
 */
export async function dismissReport(id, { reason } = {}) {
  const report = setStatus(id, "dismissed");
  const result = await withMockDelay({ report });
  if (report) {
    logAuditEvent({
      action: AUDIT_ACTIONS.REPORT_DISMISS,
      target: { label: `Report ${id}`, href: `/dashboard/admin/reports?report=${id}` },
      metadata: { reportId: id, reason: reason || null },
    });
  }
  return result;
}

/**
 * Apply a moderation action to the report's target (e.g. take the content down),
 * mark the report actioned, then emit a non-blocking audit event.
 *
 * @param {string} id
 * @param {{ action?: string, reason?: string }} [opts]
 * @returns {Promise<{ report: object | null }>}
 */
export async function applyActionToTarget(id, { action = "takedown", reason } = {}) {
  const report = setStatus(id, "actioned");
  const result = await withMockDelay({ report });
  if (report) {
    logAuditEvent({
      action: AUDIT_ACTIONS.REPORT_ACTION,
      target: {
        label: report.target?.title || `Report ${id}`,
        href: `/dashboard/admin/reports?report=${id}`,
      },
      metadata: {
        reportId: id,
        appliedAction: action,
        targetType: report.target?.type,
        targetId: report.target?.id,
        reason: reason || null,
      },
    });
  }
  return result;
}
