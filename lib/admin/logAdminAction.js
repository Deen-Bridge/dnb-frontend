/**
 * Shared helper function to log administrative actions.
 *
 * This function should be called from all admin mutation flows
 * to ensure consistent audit trail across the platform.
 *
 * @param {Object} params - The action parameters
 * @param {string} params.action - The action identifier (e.g., "user.ban", "course.approve")
 * @param {string} params.category - The action category (user, course, payment, moderation, system)
 * @param {Object} params.target - The target of the action
 * @param {string} params.target.type - The target type (user, course, transaction, etc.)
 * @param {string} params.target.id - The target ID
 * @param {string} params.target.name - The target display name
 * @param {string} params.summary - A human-readable summary of the action
 * @param {Object} [params.metadata] - Additional metadata to log
 *
 * @example
 * ```js
 * import { logAdminAction } from "@/lib/admin/logAdminAction";
 *
 * // After banning a user
 * await logAdminAction({
 *   action: "user.ban",
 *   category: "user",
 *   target: {
 *     type: "user",
 *     id: userId,
 *     name: userEmail,
 *   },
 *   summary: `Banned user for ${reason}`,
 *   metadata: { reason, duration },
 * });
 * ```
 *
 * @returns {Promise<{ success: boolean, logId?: string, error?: string }>}
 */
export async function logAdminAction({
  action,
  category,
  target,
  summary,
  metadata = {},
}) {
  // Validate required fields
  if (!action || !category || !target || !summary) {
    console.error("logAdminAction: Missing required fields");
    return { success: false, error: "Missing required fields" };
  }

  // Valid categories
  const validCategories = ["user", "course", "payment", "moderation", "system"];
  if (!validCategories.includes(category)) {
    console.error(`logAdminAction: Invalid category "${category}"`);
    return { success: false, error: `Invalid category: ${category}` };
  }

  try {
    // Get current user's IP address (client-side approximation)
    let ipAddress = "unknown";
    if (typeof window !== "undefined") {
      try {
        // In production, this would come from the request headers on the server
        ipAddress = "client-side";
      } catch {
        ipAddress = "unavailable";
      }
    }

    // Prepare log entry
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

    // Send to API
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

    // In development, still return success but log the error
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

/**
 * Helper to create standardized action strings.
 *
 * @param {string} category - The category (user, course, etc.)
 * @param {string} verb - The action verb (create, update, delete, etc.)
 * @returns {string} The formatted action string
 *
 * @example
 * ```js
 * const action = createAction("user", "ban"); // "user.ban"
 * const action = createAction("course", "approve"); // "course.approve"
 * ```
 */
export function createAction(category, verb) {
  return `${category}.${verb}`;
}

/**
 * Pre-defined action constants for common operations.
 */
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
};

export default logAdminAction;
