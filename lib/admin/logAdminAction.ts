export interface AdminActionTarget {
  type: string;
  id: string;
  name: string;
}

export interface LogAdminActionParams {
  action: string;
  category: string;
  target: AdminActionTarget;
  summary: string;
  metadata?: Record<string, any>; // TODO(types): Extra metadata dictionary
}

export interface LogAdminActionResult {
  success: boolean;
  logId?: string;
  error?: string;
}

export async function logAdminAction({
  action,
  category,
  target,
  summary,
  metadata = {},
}: LogAdminActionParams): Promise<LogAdminActionResult> {
  if (!action || !category || !target || !summary) {
    console.error("logAdminAction: Missing required fields");
    return { success: false, error: "Missing required fields" };
  }

  const validCategories = ["user", "course", "payment", "moderation", "system"];
  if (!validCategories.includes(category)) {
    console.error(`logAdminAction: Invalid category "${category}"`);
    return { success: false, error: `Invalid category: ${category}` };
  }

  try {
    let ipAddress = "unknown";
    if (typeof window !== "undefined") {
      try {
        ipAddress = "client-side";
      } catch {
        ipAddress = "unavailable";
      }
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      category,
      target: {
        type: target.type,
        id: target.id,
        name: target.name,
      },
      summary,
      metadata,
      ip: ipAddress,
    };

    const response = await fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logEntry),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to log action");
    }

    const data = await response.json();

    return {
      success: true,
      logId: data.id,
    };
  } catch (error) {
    console.error("logAdminAction: Failed to log action", error);

    if (process.env.NODE_ENV === "development") {
      console.warn("logAdminAction: Audit logging failed but continuing in development mode");
      return {
        success: true,
        logId: `dev_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function createAction(category: string, verb: string): string {
  return `${category}.${verb}`;
}

export const ADMIN_ACTIONS = {
  // User actions
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_BAN: "user.ban",
  USER_UNBAN: "user.unban",
  USER_VERIFY: "user.verify",
  USER_ROLE_CHANGE: "user.role_change",

  // Course actions
  COURSE_CREATE: "course.create",
  COURSE_UPDATE: "course.update",
  COURSE_DELETE: "course.delete",
  COURSE_APPROVE: "course.approve",
  COURSE_REJECT: "course.reject",
  COURSE_FEATURE: "course.feature",
  COURSE_UNFEATURE: "course.unfeature",

  // Payment actions
  PAYMENT_REFUND: "payment.refund",
  PAYMENT_PAYOUT: "payment.payout",
  PAYMENT_DISPUTE: "payment.dispute",
  PAYMENT_RESOLVE: "payment.resolve",

  // Moderation actions
  MODERATION_REVIEW: "moderation.review",
  MODERATION_FLAG: "moderation.flag",
  MODERATION_REMOVE: "moderation.remove",
  MODERATION_RESTORE: "moderation.restore",

  // System actions
  SYSTEM_CONFIG: "system.config",
  SYSTEM_BACKUP: "system.backup",
  SYSTEM_MAINTENANCE: "system.maintenance",
  SYSTEM_CACHE_CLEAR: "system.cache_clear",
} as const;

export default logAdminAction;
