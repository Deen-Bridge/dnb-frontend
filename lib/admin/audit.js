/**
 * Shared admin audit-logging wrapper (#309).
 * ===========================================================================
 * A standardized, **non-blocking (fire-and-forget)** facade every admin
 * mutation flow calls right after a privileged action succeeds, so that
 * role changes, bans, content takedowns, refunds, broadcasts, and flag
 * toggles leave a durable, reviewable trail — without a logging hiccup ever
 * being able to break or block the triggering UI.
 *
 * This module is deliberately **framework-agnostic plain JS** (no `"use
 * client"`, no React): it is safe to import from hooks, client components,
 * plain action modules, and route handlers alike.
 *
 * Layering
 * --------
 *   call site ──▶ logAuditEvent()  (this file — validate, normalize,
 *                                    fire-and-forget, report failures)
 *                      │
 *                      └─▶ logAdminAction()  (lib/actions/admin-audit.js —
 *                                             owns the POST contract / mock)
 *                                 │
 *                                 └─▶ TODO(backend): POST /api/admin/audit-logs
 *
 * The wrapper never returns a value the caller is expected to await in its
 * critical path. Any error — validation or a rejected POST — is swallowed
 * and reported to telemetry without attaching event data, so the mutation
 * the admin performed is never undone
 * or delayed by audit logging.
 *
 * Flows that emit audit events (see lib/admin/AUDIT.md for the live list and
 * how to add a new one):
 *   1. Role change   — hooks/useAdminTeam.js (demote / revoke)
 *   2. User ban      — lib/actions/admin-users.js (banUser)
 *   3. Content takedown — lib/actions/admin-moderation.js (takedownContent)
 *   4. Payment refund   — lib/actions/admin-payments.js (refundPayment)
 *   5. Broadcast send   — lib/actions/admin-broadcast.js (sendBroadcast)
 *   6. Feature-flag toggle — hooks/useFeatureFlags.js (toggleFlag)
 */

import { logAdminAction } from "@/lib/actions/admin-audit";

/**
 * Typed action constants. Using these instead of freeform strings keeps the
 * audit vocabulary consistent across every call site and lets the wrapper
 * validate what it is asked to log.
 *
 * @readonly
 */
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

  // Report moderation
  REPORT_ESCALATE: "report.escalate",
  REPORT_DISMISS: "report.dismiss",
  REPORT_ACTION: "report.action",

  // Payments
  REFUND: "payment.refund",

  // Communications
  BROADCAST: "broadcast.send",
  EMERGENCY_BROADCAST: "broadcast.emergency",

  // Platform / feature flags
  FLAG_TOGGLE: "flag.toggle",
  FLAG_CREATE: "flag.create",
  SETTINGS_CHANGE: "settings.change",

  // Course moderation
  COURSE_TAKEDOWN: "course.takedown",
  COURSE_UPDATED: "course.updated",

  // Educator verifications
  VERIFICATION_APPROVE: "verification.approve",
  VERIFICATION_REJECT: "verification.reject",
  VERIFICATION_BULK_APPROVE: "verification.bulk_approve",
  VERIFICATION_BULK_REJECT: "verification.bulk_reject",
});

/**
 * Canonical categories, mirroring the audit-log viewer's filter vocabulary in
 * `lib/actions/admin-audit.js` ({@link AUDIT_CATEGORIES} there).
 *
 * @readonly
 */
export const AUDIT_CATEGORIES = Object.freeze([
  "user",
  "course",
  "payment",
  "moderation",
  "system",
]);

/**
 * Maps each typed action to the category the viewer files it under. Falls back
 * to `"system"` for unknown actions so a log never carries an invalid category.
 *
 * @readonly
 */
const ACTION_CATEGORY = Object.freeze({
  [AUDIT_ACTIONS.ROLE_CHANGE]: "user",
  [AUDIT_ACTIONS.ROLE_DEMOTE]: "user",
  [AUDIT_ACTIONS.ROLE_REVOKE]: "user",
  [AUDIT_ACTIONS.BAN]: "user",
  [AUDIT_ACTIONS.UNBAN]: "user",
  [AUDIT_ACTIONS.SUSPEND]: "user",
  [AUDIT_ACTIONS.TAKEDOWN]: "moderation",
  [AUDIT_ACTIONS.RESTORE]: "moderation",
  [AUDIT_ACTIONS.REPORT_ESCALATE]: "moderation",
  [AUDIT_ACTIONS.REPORT_DISMISS]: "moderation",
  [AUDIT_ACTIONS.REPORT_ACTION]: "moderation",
  [AUDIT_ACTIONS.REFUND]: "payment",
  [AUDIT_ACTIONS.BROADCAST]: "system",
  [AUDIT_ACTIONS.EMERGENCY_BROADCAST]: "system",
  [AUDIT_ACTIONS.FLAG_TOGGLE]: "system",
  [AUDIT_ACTIONS.FLAG_CREATE]: "system",
  [AUDIT_ACTIONS.SETTINGS_CHANGE]: "system",
  [AUDIT_ACTIONS.COURSE_TAKEDOWN]: "course",
  [AUDIT_ACTIONS.COURSE_UPDATED]: "course",
  [AUDIT_ACTIONS.VERIFICATION_APPROVE]: "user",
  [AUDIT_ACTIONS.VERIFICATION_REJECT]: "user",
  [AUDIT_ACTIONS.VERIFICATION_BULK_APPROVE]: "user",
  [AUDIT_ACTIONS.VERIFICATION_BULK_REJECT]: "user",
});

/**
 * Resolve the acting admin from the client session cookie. This is a
 * **best-effort, client-side hint only** — the backend authoritatively
 * resolves the actor from the session on the server and MUST ignore any
 * client-supplied actor (see the POST contract in `lib/actions/admin-audit.js`).
 * Returns `null` on the server or when no session is present.
 *
 * @returns {{id: string, name: string}|null}
 */
/**
 * Normalize a caller-supplied `target` into the `{ label, href }` shape the
 * audit service persists. Accepts either a bare string label or an object with
 * any of `label` / `name` / `href` / `id` / `type`.
 *
 * @param {string|{label?: string, name?: string, href?: string|null, id?: string, type?: string}} [target]
 * @returns {{label: string, href: string|null}}
 */
function normalizeTarget(target) {
  if (!target) return { label: "—", href: null };
  if (typeof target === "string") return { label: target, href: null };
  return {
    label: target.label || target.name || target.id || "—",
    href: target.href ?? null,
  };
}

function reportAuditFailure() {
  void import("@sentry/nextjs")
    .then(({ captureException }) => {
      captureException(new Error("[audit] Failed to persist audit event"));
    })
    .catch(() => undefined);
}

/**
 * Log a single admin audit event. **Fire-and-forget and non-throwing.**
 *
 * The call kicks off an asynchronous, best-effort POST and returns immediately
 * — callers MUST NOT `await` it in their critical path. If the POST rejects (or
 * anything else goes wrong), the failure is swallowed and a generic error is
 * sent to telemetry without event data, so audit logging can never break or
 * block the mutation that triggered it.
 *
 * Unknown actions are still logged so a new flow that forgot to add a constant
 * still leaves a trail.
 *
 * TODO(backend): POST /api/admin/audit-logs
 *   - Delegated through `logAdminAction` in `lib/actions/admin-audit.js`, which
 *     owns the request contract. Body: { action, category, target:{label,href},
 *     summary }. The server resolves `actor` + `ip` from the session/request
 *     and ignores any client-supplied values.
 *
 * @param {object} event
 * @param {string} event.action  One of {@link AUDIT_ACTIONS} (freeform allowed but warned).
 * @param {string|{label?: string, name?: string, href?: string|null, id?: string, type?: string}} [event.target]
 *        What the action was performed on — a label string or a descriptor object.
 * @param {object} [event.metadata]  Extra structured context (reason, amounts, ids …).
 * @param {string} [event.summary]   Optional human summary; derived from action/target when omitted.
 * @returns {void} Nothing to await — logging is intentionally out of the critical path.
 *
 * @example
 * import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
 *
 * async function banUser(user, reason) {
 *   await api.ban(user.id);              // the real, awaited mutation
 *   logAuditEvent({                      // fire-and-forget — no await
 *     action: AUDIT_ACTIONS.BAN,
 *     target: { label: user.email, id: user.id, href: `/dashboard/admin/users/${user.id}` },
 *     metadata: { reason },
 *   });
 * }
 */
export function logAuditEvent({ action, target, metadata = {}, summary } = {}) {
  const normalizedTarget = normalizeTarget(target);
  const category = ACTION_CATEGORY[action] || "system";

  if (!action) {
    return;
  }

  const derivedSummary =
    summary || `${action} on ${normalizedTarget.label}`.trim();

  // Fire-and-forget: start the POST, never await it here, and report only a
  // generic failure to telemetry so audit data and user details are not leaked.
  Promise.resolve()
    .then(() =>
      logAdminAction({
        action,
        category,
        target: normalizedTarget,
        metadata,
        summary: derivedSummary,
      })
    )
    .then((result) => {
      if (result && result.success === false) reportAuditFailure();
    })
    .catch(() => {
      reportAuditFailure();
    });
}

/**
 * One-liner integration helper: run a mutation, and **only if it resolves**
 * fire the corresponding audit event (non-blocking). The mutation's result is
 * returned unchanged and its rejection propagates untouched — a failed
 * mutation is never audited as a success, and audit logging never alters the
 * mutation's outcome.
 *
 * @template T
 * @param {string} action  One of {@link AUDIT_ACTIONS}.
 * @param {string|{label?: string, name?: string, href?: string|null, id?: string, type?: string}} target
 *        Target descriptor, or a function `(result) => descriptor` to derive it from the result.
 * @param {() => Promise<T>} mutationFn  The awaited mutation to perform.
 * @param {object} [metadata]  Extra structured context to attach to the event.
 * @returns {Promise<T>} Whatever `mutationFn` resolves to.
 *
 * @example
 * import { withAudit, AUDIT_ACTIONS } from "@/lib/admin/audit";
 *
 * const result = await withAudit(
 *   AUDIT_ACTIONS.REFUND,
 *   { label: `Order ${orderId}`, href: `/dashboard/admin/payments/${orderId}` },
 *   () => refundPayment(orderId, amount),
 *   { amount, reason },
 * );
 */
export async function withAudit(action, target, mutationFn, metadata = {}) {
  const result = await mutationFn();
  const resolvedTarget =
    typeof target === "function" ? target(result) : target;
  logAuditEvent({ action, target: resolvedTarget, metadata });
  return result;
}

export default logAuditEvent;
