/**
 * Admin user-moderation service — ban / unban.
 * ---------------------------------------------------------------------------
 * **STUBBED (#309).** The ban flow does not have a backend yet, so this module
 * mocks the mutation to demonstrate the shared audit-logging integration
 * (`lib/admin/audit.js`). Swap the mock body for an `axiosInstance` call (see
 * `lib/config/axios.config.js`) when the backend lands.
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Ban a user, then emit a non-blocking audit event.
 *
 * TODO(backend): POST /api/admin/users/:id/ban
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { reason: string }
 *   - 200 → { user: { id, status: "banned" } }
 *
 * @param {string} userId
 * @param {{ reason?: string, email?: string }} [context]
 * @returns {Promise<{ user: { id: string, status: "banned" } }>}
 */
export async function banUser(userId, context = {}) {
  // TODO(backend):
  //   const { data } = await axiosInstance.post(`/api/admin/users/${userId}/ban`, {
  //     reason: context.reason,
  //   });
  const result = await withMockDelay({ user: { id: userId, status: "banned" } });

  // Fire-and-forget audit trail — never awaited, never blocks the caller.
  logAuditEvent({
    action: AUDIT_ACTIONS.BAN,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { reason: context.reason || null },
  });

  return result;
}
