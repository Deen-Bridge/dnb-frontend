import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

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
] as const);

export type DismissalReasonValue = typeof DISMISSAL_REASONS[number]["value"];

const VALID_DISMISSAL_REASONS = new Set<string>(DISMISSAL_REASONS.map((r) => r.value));

const REPORTER_HISTORY: Map<string, number> = new Map([
  ["rp_1", 0],
  ["rp_2", 3],
  ["rp_3", 7],
  ["rp_4", 2],
  ["rp_5", 5],
]);

function incrementReporterCount(reporterId: string): void {
  REPORTER_HISTORY.set(reporterId, (REPORTER_HISTORY.get(reporterId) ?? 0) + 1);
}

export async function getReporterReportCount(reporterId: string): Promise<number> {
  return Promise.resolve(REPORTER_HISTORY.get(reporterId) ?? 0);
}

export async function isFirstTimeReporter(reporterId: string): Promise<boolean> {
  const count = await getReporterReportCount(reporterId);
  return count === 0;
}

export interface SendDismissalNotificationParams {
  reporterId?: string;
  reportId?: string;
  dismissalReason?: string;
}

export async function sendDismissalNotification({
  reporterId,
  reportId,
  dismissalReason,
}: SendDismissalNotificationParams = {}): Promise<{ queued: boolean; notificationId: string }> {
  void reporterId;
  void reportId;
  void dismissalReason;
  return withMockDelay({
    queued: true,
    notificationId: `ntf_${Math.random().toString(36).slice(2, 10)}`,
  });
}

export interface DismissReportParams {
  reportId?: string;
  reporterId?: string;
  reason?: string;
  notify?: boolean;
}

export interface DismissReportResult {
  report: {
    id: string;
    status: string;
    dismissalReason: string;
    reporterNotified: boolean;
  };
  notificationId: string | null;
}

export async function dismissReport({
  reportId,
  reporterId,
  reason,
  notify,
}: DismissReportParams = {}): Promise<DismissReportResult> {
  if (!reportId) throw new Error("reportId is required.");
  if (!reporterId) throw new Error("reporterId is required.");
  if (!reason || !VALID_DISMISSAL_REASONS.has(reason)) {
    throw new Error(`Invalid dismissal reason: "${reason}". Must be one of: ${[...VALID_DISMISSAL_REASONS].join(", ")}.`);
  }

  const firstTime = await isFirstTimeReporter(reporterId);
  const shouldNotify = notify !== undefined ? notify : firstTime;

  const result = await withMockDelay({
    report: {
      id: reportId,
      status: "dismissed",
      dismissalReason: reason,
      reporterNotified: shouldNotify,
    },
  });

  let notificationId: string | null = null;
  if (shouldNotify) {
    const { notificationId: nid } = await sendDismissalNotification({
      reporterId,
      reportId,
      dismissalReason: reason,
    });
    notificationId = nid;
  }

  incrementReporterCount(reporterId);

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

export interface TakedownContentParams {
  id: string;
  type?: string;
  label?: string;
  reason?: string;
}

export interface TakedownContentResult {
  content: {
    id: string;
    type: string;
    status: string;
  };
}

export async function takedownContent({
  id,
  type = "content",
  label,
  reason,
}: TakedownContentParams): Promise<TakedownContentResult> {
  const result = await withMockDelay({
    content: { id, type, status: "removed" },
  });

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
