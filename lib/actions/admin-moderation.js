/**
 * Admin content-moderation service — takedown / restore / report dismissal.
 * ---------------------------------------------------------------------------
 * **STUBBED (#309, #293).** The takedown and dismissal flows have no backend
 * yet, so this module mocks mutations to demonstrate the shared audit-logging
 * integration (`lib/admin/audit.js`). Swap mock bodies for `axiosInstance`
 * calls (see `lib/config/axios.config.js`) when the backend lands.
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Predefined dismissal reasons shown to the admin in the picker.
 * These are the only accepted values for `dismissReport`'s `reason` param.
 *
 * @readonly
 */
export const DISMISSAL_REASONS = Object.freeze([
  {
    value: "no_violation",
    label: "Doesn't violate policy",
  },
  {
    value: "already_handled",
    label: "Already handled",
  },
  {
    value: "insufficient_evidence",
    label: "Insufficient evidence",
  },
  {
    value: "duplicate",
    label: "Duplicate",
  },
]);

/** All valid reason values, for fast validation. */
const VALID_DISMISSAL_REASONS = new Set(DISMISSAL_REASONS.map((r) => r.value));

// ---------------------------------------------------------------------------
// Reporter history (first-time vs. repeat reporter detection)
// ---------------------------------------------------------------------------

/**
 * In-memory reporter submission history: maps `reporterId → count`.
 *
 * In production this would be fetched from the backend.
 * TODO(backend): GET /api/admin/reporters/:id/report-count
 *   - 200 → { reporterId: string, count: number }
 *
 * Pre-seeded so the UI demo behaves consistently across page loads within
 * the same session. Reporters rp_2..rp_5 have submitted before; rp_1 has not.
 *
 * @type {Map<string, number>}
 */
const REPORTER_HISTORY = new Map([
  ["rp_1", 0], // first-time — smart default: notify ON
  ["rp_2", 3],
  ["rp_3", 7],
  ["rp_4", 2],
  ["rp_5", 5],
]);

/**
 * Increment the in-memory report count for a reporter after a successful
 * dismissal so subsequent calls within the same session reflect the latest
 * state.
 *
 * @param {string} reporterId
 */
function incrementReporterCount(reporterId) {
  REPORTER_HISTORY.set(reporterId, (REPORTER_HISTORY.get(reporterId) ?? 0) + 1);
}

/**
 * Get the number of reports a reporter has previously submitted.
 *
 * TODO(backend): GET /api/admin/reporters/:id/report-count
 *
 * @param {string} reporterId
 * @returns {Promise<number>}
 */
export async function getReporterReportCount(reporterId) {
  return Promise.resolve(REPORTER_HISTORY.get(reporterId) ?? 0);
}

/**
 * Determine whether a reporter is first-time (no prior reports) or repeat.
 *
 * TODO(backend): Derived from GET /api/admin/reporters/:id/report-count
 *
 * @param {string} reporterId
 * @returns {Promise<boolean>} `true` if this is the reporter's first report.
 */
export async function isFirstTimeReporter(reporterId) {
  const count = await getReporterReportCount(reporterId);
  return count === 0;
}

// ---------------------------------------------------------------------------
// Courtesy notification stub
// ---------------------------------------------------------------------------

/**
 * Send a courtesy notification to a reporter informing them that their report
 * was reviewed but dismissed. This is a **stub** — the actual delivery is
 * blocked until the announcements / notification infrastructure is ready.
 *
 * TODO(backend): POST /api/admin/notifications/reporter-courtesy
 *   - Auth: admin session.
 *   - Payload: { reporterId: string, reportId: string, dismissalReason: string }
 *   - 202 → { queued: true, notificationId: string }
 *
 * @param {{ reporterId: string, reportId: string, dismissalReason: string }} params
 * @returns {Promise<{ queued: boolean, notificationId: string }>}
 */
export async function sendDismissalNotification({ reporterId, reportId, dismissalReason } = {}) {
  // TODO(backend):
  //   const { data } = await axiosInstance.post(
  //     "/api/admin/notifications/reporter-courtesy",
  //     { reporterId, reportId, dismissalReason },
  //   );
  const result = await withMockDelay({
    queued: true,
    notificationId: `ntf_${Math.random().toString(36).slice(2, 10)}`,
  });
  return result;
}

// ---------------------------------------------------------------------------
// Dismissal action
// ---------------------------------------------------------------------------

/**
 * Dismiss a report with a structured reason and optionally notify the
 * reporter, then emit a non-blocking audit event.
 *
 * First-time reporters receive a notification by default; repeat reporters
 * do not. Callers may override this default by passing an explicit
 * `notify` boolean (the checkbox value from `DismissReportDialog`).
 *
 * TODO(backend): POST /api/admin/reports/:id/dismiss
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { reason: string, notify: boolean }
 *   - 200 → { report: { id, status: "dismissed", dismissalReason: string,
 *               reporterNotified: boolean } }
 *   - 422 for an unknown reason value.
 *
 * @param {{
 *   reportId: string,
 *   reporterId: string,
 *   reason: string,
 *   notify?: boolean,
 * }} params
 * @returns {Promise<{
 *   report: { id: string, status: "dismissed", dismissalReason: string, reporterNotified: boolean },
 *   notificationId: string | null,
 * }>}
 */
export async function dismissReport({ reportId, reporterId, reason, notify } = {}) {
  if (!reportId) throw new Error("reportId is required.");
  if (!reporterId) throw new Error("reporterId is required.");
  if (!VALID_DISMISSAL_REASONS.has(reason)) {
    throw new Error(`Invalid dismissal reason: "${reason}". Must be one of: ${[...VALID_DISMISSAL_REASONS].join(", ")}.`);
  }

  // Resolve smart default: notify ON for first-time reporters, OFF for repeat.
  const firstTime = await isFirstTimeReporter(reporterId);
  const shouldNotify = notify !== undefined ? notify : firstTime;

  // TODO(backend):
  //   const { data } = await axiosInstance.post(
  //     `/api/admin/reports/${reportId}/dismiss`,
  //     { reason, notify: shouldNotify },
  //   );
  const result = await withMockDelay({
    report: {
      id: reportId,
      status: "dismissed",
      dismissalReason: reason,
      reporterNotified: shouldNotify,
    },
  });

  // Optionally send the courtesy notification stub.
  let notificationId = null;
  if (shouldNotify) {
    const { notificationId: nid } = await sendDismissalNotification({
      reporterId,
      reportId,
      dismissalReason: reason,
    });
    notificationId = nid;
  }

  // Update in-memory history so isFirstTimeReporter reflects the new state.
  incrementReporterCount(reporterId);

  // Fire-and-forget audit trail.
  logAuditEvent({
    action: AUDIT_ACTIONS.REPORT_DISMISS,
    target: {
      label: `Report ${reportId}`,
      id: reportId,
      href: `/admin/reports`,
    },
    metadata: { reporterId, reason, reporterNotified: shouldNotify },
  });

  return { ...result, notificationId };
}

/**
 * Take down a piece of content (comment, review, reel, …), then emit a
 * non-blocking audit event.
 *
 * TODO(backend): POST /api/admin/moderation/:type/:id/takedown
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { reason: string }
 *   - 200 → { content: { id, type, status: "removed" } }
 *
 * @param {{ id: string, type?: string, label?: string, reason?: string }} params
 * @returns {Promise<{ content: { id: string, type: string, status: "removed" } }>}
 */
export async function takedownContent({ id, type = "content", label, reason } = {}) {
  // TODO(backend):
  //   const { data } = await axiosInstance.post(
  //     `/api/admin/moderation/${type}/${id}/takedown`,
  //     { reason },
  //   );
  const result = await withMockDelay({
    content: { id, type, status: "removed" },
  });

  // Fire-and-forget audit trail — never awaited, never blocks the caller.
  logAuditEvent({
    action: AUDIT_ACTIONS.TAKEDOWN,
    target: {
      label: label || `${type} ${id}`,
      id,
      href: `/dashboard/admin/moderation/${id}`,
    },
    metadata: { type, reason: reason || null },
  });

  return result;
}
