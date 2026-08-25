/**
 * Admin reports service — list and dismiss reports.
 * ---------------------------------------------------------------------------
 * **STUBBED (#293).** The moderation API is not available yet, so this module
 * provides the UI contract and deterministic mock data. Replace the mock
 * bodies with axiosInstance calls when the backend endpoint lands.
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 150;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** The only reasons a moderator may use to dismiss a report. */
export const DISMISSAL_REASONS = Object.freeze([
  { value: "does-not-violate-policy", label: "Doesn't violate policy" },
  { value: "already-handled", label: "Already handled" },
  { value: "insufficient-evidence", label: "Insufficient evidence" },
  { value: "duplicate", label: "Duplicate" },
]);

const VALID_REASON_VALUES = new Set(DISMISSAL_REASONS.map(({ value }) => value));

const MOCK_REPORTS = [
  {
    id: "R-5521",
    subject: "Comment on Seerah Q&A",
    contentType: "comment",
    contentPreview: "I found this answer confusing and wanted it reviewed.",
    reporter: { id: "user-101", name: "Hafsa Ali", priorReportCount: 0 },
  },
  {
    id: "R-5490",
    subject: "Review on Foundations of Tajweed",
    contentType: "review",
    contentPreview: "This review repeats a report that was already resolved.",
    reporter: { id: "user-202", name: "Yusuf Ibrahim", priorReportCount: 2 },
  },
];

function decorateReport(report) {
  return {
    ...report,
    notifyReporterByDefault: isFirstTimeReporter(report.reporter),
  };
}

/**
 * Return whether the reporter has submitted any earlier reports.
 * The backend can map its own history field to `priorReportCount` at the
 * service boundary without changing the UI contract.
 */
export function isFirstTimeReporter(reporter = {}) {
  const priorReportCount = Number(reporter.priorReportCount ?? 0);
  return Number.isFinite(priorReportCount) && priorReportCount === 0;
}

/** Resolve the smart courtesy-notification default for a reporter. */
export function getDefaultNotificationPreference(reporter) {
  return isFirstTimeReporter(reporter);
}

/**
 * List unresolved reports.
 *
 * TODO(backend): GET /api/admin/reports?status=pending
 *   - Auth: admin session; server enforces the moderator's permissions.
 *   - 200 -> { reports: Report[] }
 */
export async function listReports() {
  // TODO(backend): return axiosInstance.get("/api/admin/reports", {
  //   params: { status: "pending" },
  // }).then((res) => res.data);
  return withMockDelay({ reports: MOCK_REPORTS.map(decorateReport) });
}

/**
 * Courtesy notification integration point. Announcements infrastructure will
 * replace this stub without changing the dismissal form or mutation contract.
 */
export async function sendCourtesyNotification({ reportId, reporterId, reason } = {}) {
  // TODO(backend): POST /api/admin/announcements/report-review
  //   { reportId, reporterId, reason, template: "report-reviewed" }
  return withMockDelay({
    status: "stubbed",
    queued: false,
    reportId,
    reporterId,
    reason,
    template: "report-reviewed",
  });
}

/**
 * Dismiss a report and optionally queue a courtesy notification.
 *
 * TODO(backend): POST /api/admin/reports/:id/dismiss
 *   { reason, notifyReporter }
 *   -> { report, notification: { status, ... } | null }
 */
export async function dismissReport({
  reportId,
  reason,
  notifyReporter = false,
} = {}) {
  if (!reportId) throw new Error("A report id is required");
  if (!VALID_REASON_VALUES.has(reason)) {
    throw new Error("Choose a valid dismissal reason");
  }

  const source = MOCK_REPORTS.find((report) => report.id === reportId);
  if (!source) throw new Error("Report not found");

  // The real endpoint will persist the status and notification decision.
  const report = decorateReport({
    ...source,
    status: "dismissed",
    dismissalReason: reason,
    notifyReporter: Boolean(notifyReporter),
    dismissedAt: new Date().toISOString(),
  });
  const notification = notifyReporter
    ? await sendCourtesyNotification({
        reportId,
        reporterId: source.reporter.id,
        reason,
      })
    : null;

  logAuditEvent({
    action: AUDIT_ACTIONS.REPORT_DISMISSED,
    target: {
      label: `Report #${reportId}`,
      id: reportId,
      href: `/dashboard/admin/reports/${reportId}`,
    },
    metadata: {
      reason,
      notifyReporter: Boolean(notifyReporter),
      reporterId: source.reporter.id,
    },
    summary: `Dismissed report #${reportId}.`,
  });

  return withMockDelay({ report, notification });
}
