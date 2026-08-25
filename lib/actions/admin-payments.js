/**
 * Admin payments service — refunds.
 * ---------------------------------------------------------------------------
 * **STUBBED (#309).** The refund flow has no backend yet, so this module mocks
 * the mutation to demonstrate the shared audit-logging integration
 * (`lib/admin/audit.js`). Swap the mock body for an `axiosInstance` call (see
 * `lib/config/axios.config.js`) when the backend lands.
 */

import { withAudit, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Refund an order, then emit a non-blocking audit event via {@link withAudit}
 * (so the event only fires if the refund actually resolves).
 *
 * TODO(backend): POST /api/admin/payments/:orderId/refund
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { amount?: number, reason: string }  // amount omitted = full refund
 *   - 200 → { refund: { orderId, amount, status: "refunded" } }
 *
 * @param {string} orderId
 * @param {{ amount?: number, reason?: string }} [context]
 * @returns {Promise<{ refund: { orderId: string, amount: number|null, status: "refunded" } }>}
 */
export async function refundPayment(orderId, context = {}) {
  const { amount = null, reason = null } = context;
  return withAudit(
    AUDIT_ACTIONS.REFUND,
    {
      label: `Order ${orderId}`,
      id: orderId,
      href: `/dashboard/admin/payments/${orderId}`,
    },
    // TODO(backend):
    //   () => axiosInstance
    //     .post(`/api/admin/payments/${orderId}/refund`, { amount, reason })
    //     .then((res) => res.data),
    () => withMockDelay({ refund: { orderId, amount, status: "refunded" } }),
    { amount, reason }
  );
}
