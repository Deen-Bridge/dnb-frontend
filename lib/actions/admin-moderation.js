/**
 * Admin content-moderation service — takedown / restore / report dismissal.
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export const COURSE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  TAKEN_DOWN: "taken_down",
});

export const TAKEDOWN_REASONS = Object.freeze([
  { value: "copyright", label: "Copyright / DMCA" },
  { value: "content-policy", label: "Content Policy Violation" },
  { value: "quality", label: "Quality Issues" },
]);

export const DISMISSAL_REASONS = Object.freeze([
  { value: "no_violation", label: "Doesn't violate policy" },
  { value: "already_handled", label: "Already handled" },
  { value: "insufficient_evidence", label: "Insufficient evidence" },
  { value: "duplicate", label: "Duplicate" },
]);

const VALID_DISMISSAL_REASONS = new Set(DISMISSAL_REASONS.map((r) => r.value));

export async function notifyEducator(educatorId, type, details) {
  // Stub for actual notification service call
  console.log(`[Notification Service] Notifying educator ${educatorId}: ${type}`, details);
  return { success: true };
}

export async function updateCourseStatus(courseId, status, { reason, note, educatorId } = {}) {
  // TODO(backend): POST /api/admin/courses/:id/status
  await withMockDelay(null);

  if (status === COURSE_STATUS.TAKEN_DOWN) {
    await notifyEducator(educatorId, "course_taken_down", { reason, note });
  }

  logAuditEvent({
    action: status === COURSE_STATUS.TAKEN_DOWN ? AUDIT_ACTIONS.COURSE_TAKEDOWN : AUDIT_ACTIONS.COURSE_UPDATED,
    target: { label: `Course ${courseId}`, href: `/dashboard/admin/courses/${courseId}` },
    metadata: { status, reason, note },
  });

  return { success: true, status };
}

export async function dismissReport({ reportId, reporterId, reason, notify } = {}) {
  if (!reportId) throw new Error("reportId is required.");
  if (!reporterId) throw new Error("reporterId is required.");
  if (!VALID_DISMISSAL_REASONS.has(reason)) {
    throw new Error(`Invalid dismissal reason: "${reason}".`);
  }

  const result = await withMockDelay({
    report: { id: reportId, status: "dismissed", dismissalReason: reason },
  });

  logAuditEvent({
    action: AUDIT_ACTIONS.REPORT_DISMISS,
    target: { label: `Report ${reportId}`, id: reportId, href: `/admin/reports` },
    metadata: { reporterId, reason },
  });

  return result;
}
