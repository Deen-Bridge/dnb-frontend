/**
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
