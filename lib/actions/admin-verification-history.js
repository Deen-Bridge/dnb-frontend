/**
 * Admin educator verification history service.
 *
 * TODO(backend): GET /api/admin/educators/:educatorId/verification-history
 *   - Auth: admin session.
 *   - 200 -> { events: [{ id, type, label, actor, timestamp, note }] }
 *
 * Until that endpoint is available, this module composes the timeline from the
 * educator/user record fields already returned to the detail page.
 */

import axiosInstance from "@/lib/config/axios.config";

const EVENT_LABELS = {
  submitted: "Submitted",
  info_requested: "Info requested",
  approved: "Approved",
  rejected: "Rejected",
  re_verified: "Re-verified",
};

const EVENT_ORDER = [
  "re_verified",
  "approved",
  "rejected",
  "info_requested",
  "submitted",
];

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeActor(value) {
  if (!value) return "System";
  if (typeof value === "string") return value;
  return value.name || value.email || value.id || "System";
}

function normalizeTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeEvent(raw, index = 0) {
  const type = raw.type || raw.status || raw.action || "submitted";
  const timestamp = normalizeTimestamp(
    firstDefined(raw.timestamp, raw.ts, raw.createdAt, raw.created_at, raw.at)
  );

  return {
    id: raw.id || `${type}-${timestamp || index}`,
    type,
    label: raw.label || EVENT_LABELS[type] || type.replace(/_/g, " "),
    actor: normalizeActor(raw.actor || raw.reviewedBy || raw.admin || raw.requestedBy),
    timestamp,
    note: raw.note || raw.reason || raw.comment || raw.summary || null,
  };
}

function sortNewestFirst(events) {
  return [...events].sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return bTime - aTime;
  });
}

function readVerificationRecord(user = {}) {
  return (
    user.verification ||
    user.verificationRecord ||
    user.educatorVerification ||
    user.educatorApplication ||
    user.application ||
    user
  );
}

function buildEvent(record, user, type, timestampFields, actorFields, noteFields = []) {
  const timestamp = normalizeTimestamp(
    firstDefined(...timestampFields.map((field) => record[field] ?? user[field]))
  );
  if (!timestamp) return null;

  return normalizeEvent({
    type,
    timestamp,
    actor: firstDefined(...actorFields.map((field) => record[field] ?? user[field])),
    note: firstDefined(...noteFields.map((field) => record[field] ?? user[field])),
  });
}

export function composeVerificationHistoryFromUser(user = {}) {
  const record = readVerificationRecord(user);
  const verificationStatus = String(
    firstDefined(record.status, record.verificationStatus, user.verificationStatus, user.status) || ""
  ).toLowerCase();
  const sourceEvents =
    record.history ||
    record.timeline ||
    record.events ||
    user.verificationHistory ||
    user.verificationEvents;

  if (Array.isArray(sourceEvents) && sourceEvents.length > 0) {
    return sortNewestFirst(sourceEvents.map(normalizeEvent));
  }

  const reviewerFields = ["reviewedBy", "reviewer", "approvedBy", "rejectedBy", "actor"];
  const events = EVENT_ORDER.map((type) => {
    if (type === "submitted") {
      return buildEvent(
        record,
        user,
        type,
        ["submittedAt", "submitted_at", "applicationSubmittedAt"],
        ["submittedBy", "createdBy", "name", "email"]
      );
    }
    if (type === "info_requested") {
      return buildEvent(
        record,
        user,
        type,
        ["infoRequestedAt", "info_requested_at", "changesRequestedAt"],
        ["infoRequestedBy", ...reviewerFields],
        ["infoRequestReason", "changesRequestedReason", "reviewNote"]
      );
    }
    if (type === "approved") {
      return buildEvent(
        record,
        user,
        type,
        ["approvedAt", "approved_at"],
        reviewerFields,
        ["approvalNote", "reviewNote"]
      );
    }
    if (type === "rejected") {
      const rejectedTimestampFields = ["rejectedAt", "rejected_at"];
      if (verificationStatus === "rejected") {
        rejectedTimestampFields.push("reviewedAt", "reviewed_at");
      }
      return buildEvent(
        record,
        user,
        type,
        rejectedTimestampFields,
        reviewerFields,
        ["rejectionReason", "reason", "reviewNote"]
      );
    }
    return buildEvent(
      record,
      user,
      type,
      ["reverifiedAt", "reVerifiedAt", "re_verified_at"],
      ["reverifiedBy", "reVerifiedBy", ...reviewerFields],
      ["reverificationNote", "reviewNote"]
    );
  }).filter(Boolean);

  return sortNewestFirst(events);
}

export async function fetchEducatorVerificationHistory(educatorId, fallbackUser) {
  try {
    const { data } = await axiosInstance.get(
      `/api/admin/educators/${educatorId}/verification-history`
    );
    const events = Array.isArray(data?.events) ? data.events : data?.history;
    return {
      source: "backend",
      events: sortNewestFirst(Array.isArray(events) ? events.map(normalizeEvent) : []),
    };
  } catch {
    // Fallback path required until the backend admin endpoint exists.
    return {
      source: "composed",
      events: composeVerificationHistoryFromUser(fallbackUser),
    };
  }
}
