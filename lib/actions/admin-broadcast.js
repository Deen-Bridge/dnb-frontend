/**
 * Admin broadcast service — send a platform-wide announcement.
 * ---------------------------------------------------------------------------
 * **STUBBED (#309).** The broadcast flow has no backend yet, so this module
 * mocks the mutation to demonstrate the shared audit-logging integration
 * (`lib/admin/audit.js`). Swap the mock body for an `axiosInstance` call (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * Supports an optional FCM push notification layer (#301).  When the caller
 * sets `alsoPush: true`, a `push` object is appended to the backend payload
 * so the server can fan out a push to targeted devices.
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import { buildBroadcastPushPayload } from "@/lib/actions/push-notifications";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Send a broadcast to an audience segment, then emit a non-blocking audit
 * event.
 *
 * TODO(backend): POST /api/admin/broadcasts
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { title: string, body: string, audience?: string,
 *                push?: { title, body, audience, clickUrl } | null }
 *   - 201 → { broadcast: { id, title, audience, sentAt } }
 *
 * @param {{ title: string, body?: string, audience?: string, alsoPush?: boolean }} payload
 * @returns {Promise<{ broadcast: { id: string, title: string, audience: string, sentAt: string } }>}
 */
export async function sendBroadcast({ title, body = "", audience = "all", alsoPush = false } = {}) {
  const pushPayload = buildBroadcastPushPayload({ title, body, audience }, { alsoPush });

  // TODO(backend):
  //   const { data } = await axiosInstance.post("/api/admin/broadcasts", {
  //     title, body, audience, ...pushPayload,
  //   });
  const result = await withMockDelay({
    broadcast: {
      id: `bc_${Math.random().toString(36).slice(2, 10)}`,
      title,
      audience,
      sentAt: new Date().toISOString(),
      pushSent: alsoPush,
    },
  });

  // Fire-and-forget audit trail — never awaited, never blocks the caller.
  logAuditEvent({
    action: AUDIT_ACTIONS.BROADCAST,
    target: { label: title || "Broadcast", href: null },
    metadata: { audience, hasBody: Boolean(body), alsoPush },
  });

  return result;
}
