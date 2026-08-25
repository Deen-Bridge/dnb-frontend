/**
 * Admin content-moderation service — takedown / restore.
 * ---------------------------------------------------------------------------
 * **STUBBED (#309).** The takedown flow has no backend yet, so this module
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
