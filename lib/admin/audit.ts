import { logAdminAction } from "@/lib/actions/admin-audit";

export const AUDIT_ACTIONS = Object.freeze({
  // Team / role management
  ROLE_CHANGE: "role.change",
  ROLE_DEMOTE: "role.demote",
  ROLE_REVOKE: "role.revoke",

  // User moderation
  BAN: "user.ban",
  UNBAN: "user.unban",
  SUSPEND: "user.suspend",

  // Content moderation
  TAKEDOWN: "content.takedown",
  RESTORE: "content.restore",
  REPORT_DISMISS: "report.dismiss",
  COURSE_TAKEDOWN: "course.takedown",
  COURSE_UPDATED: "course.updated",

  // Payments
  REFUND: "payment.refund",

  // Communications
  BROADCAST: "broadcast.send",

  // Platform / feature flags
  FLAG_TOGGLE: "flag.toggle",
  FLAG_CREATE: "flag.create",
  SETTINGS_CHANGE: "settings.change",

  // Educator verifications
  VERIFICATION_APPROVE: "verification.approve",
  VERIFICATION_REJECT: "verification.reject",
  VERIFICATION_BULK_APPROVE: "verification.bulk_approve",
  VERIFICATION_BULK_REJECT: "verification.bulk_reject",
} as const);

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

export const AUDIT_CATEGORIES = Object.freeze([
  "user",
  "course",
  "payment",
  "moderation",
  "system",
] as const);

export type AuditCategory = typeof AUDIT_CATEGORIES[number];

const KNOWN_ACTIONS: ReadonlySet<string> = new Set(Object.values(AUDIT_ACTIONS));

const ACTION_CATEGORY: Record<string, AuditCategory> = Object.freeze({
  [AUDIT_ACTIONS.ROLE_CHANGE]: "user",
  [AUDIT_ACTIONS.ROLE_DEMOTE]: "user",
  [AUDIT_ACTIONS.ROLE_REVOKE]: "user",
  [AUDIT_ACTIONS.BAN]: "user",
  [AUDIT_ACTIONS.UNBAN]: "user",
  [AUDIT_ACTIONS.SUSPEND]: "user",
  [AUDIT_ACTIONS.TAKEDOWN]: "moderation",
  [AUDIT_ACTIONS.RESTORE]: "moderation",
  [AUDIT_ACTIONS.REPORT_DISMISS]: "moderation",
  [AUDIT_ACTIONS.COURSE_TAKEDOWN]: "course",
  [AUDIT_ACTIONS.COURSE_UPDATED]: "course",
  [AUDIT_ACTIONS.REFUND]: "payment",
  [AUDIT_ACTIONS.BROADCAST]: "system",
  [AUDIT_ACTIONS.FLAG_TOGGLE]: "system",
  [AUDIT_ACTIONS.FLAG_CREATE]: "system",
  [AUDIT_ACTIONS.VERIFICATION_APPROVE]: "user",
  [AUDIT_ACTIONS.VERIFICATION_REJECT]: "user",
  [AUDIT_ACTIONS.VERIFICATION_BULK_APPROVE]: "user",
  [AUDIT_ACTIONS.VERIFICATION_BULK_REJECT]: "user",
});

export interface AuditTargetDescriptor {
  label?: string;
  name?: string;
  href?: string | null;
  id?: string;
  type?: string;
}

export type AuditTarget = string | AuditTargetDescriptor;

export interface NormalizedAuditTarget {
  label: string;
  href: string | null;
}

export interface AuditEventParams {
  action?: string;
  target?: AuditTarget;
  metadata?: Record<string, any>; // TODO(types): Audit metadata context dictionary
  summary?: string;
}

function resolveActor(): { id: string; name: string } | null {
  if (typeof document === "undefined") return null;
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userInfo="))
      ?.split("=")[1];
    if (!raw) return null;
    const user = JSON.parse(decodeURIComponent(raw));
    const id = user?.id || user?._id;
    if (!id) return null;
    return { id: String(id), name: user?.name || user?.email || "Admin" };
  } catch {
    return null;
  }
}

function normalizeTarget(target?: AuditTarget): NormalizedAuditTarget {
  if (!target) return { label: "—", href: null };
  if (typeof target === "string") return { label: target, href: null };
  return {
    label: target.label || target.name || target.id || "—",
    href: target.href ?? null,
  };
}

export function logAuditEvent({ action, target, metadata = {}, summary }: AuditEventParams = {}): void {
  const timestamp = new Date().toISOString();
  const actor = resolveActor();
  const normalizedTarget = normalizeTarget(target);
  const category = (action && ACTION_CATEGORY[action]) || "system";

  if (!action) {
    console.warn("[audit] logAuditEvent called without an action", {
      target: normalizedTarget,
      metadata,
    });
    return;
  }
  if (!KNOWN_ACTIONS.has(action)) {
    console.warn(
      `[audit] Unknown action "${action}" — logging anyway. Add it to AUDIT_ACTIONS in lib/admin/audit.js.`
    );
  }

  const derivedSummary =
    summary || `${action} on ${normalizedTarget.label}`.trim();

  const event = {
    action,
    category,
    actor,
    target: normalizedTarget,
    metadata,
    summary: derivedSummary,
    timestamp,
  };

  Promise.resolve()
    .then(() =>
      logAdminAction({
        action,
        category,
        target: normalizedTarget,
        summary: derivedSummary,
      })
    )
    .catch((error: unknown) => {
      console.error("[audit] Failed to persist audit event; falling back to console.", {
        event,
        error: error instanceof Error ? error.message : error,
      });
    });
}

export async function withAudit<T>(
  action: string,
  target: AuditTarget | ((result: T) => AuditTarget),
  mutationFn: () => Promise<T>,
  metadata: Record<string, any> = {} // TODO(types): Mutation audit metadata context dictionary
): Promise<T> {
  const result = await mutationFn();
  const resolvedTarget =
    typeof target === "function" ? target(result) : target;
  logAuditEvent({ action, target: resolvedTarget, metadata });
  return result;
}

export default logAuditEvent;
