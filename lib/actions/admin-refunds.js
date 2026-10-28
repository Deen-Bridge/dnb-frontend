/**
 * Admin refunds register service (#282) — status-tracked refund monitoring.
 * ---------------------------------------------------------------------------
 * **Wired to the backend** (`#479`): every call goes through `axiosInstance`
 * (see `lib/config/axios.config.js`) instead of the mock data this module
 * used to resolve with. The page keeps its existing loading / empty / error
 * states — a failed list request rejects with a readable message and the
 * register degrades to its error state rather than crashing.
 *
 * Endpoints (paymentRoutes.js on the backend):
 *
 *   GET  /api/stellar/payment/refunds                 → { refunds: Refund[] }
 *   POST /api/stellar/payment/refunds/:refundId/retry → { refund: Refund }
 *
 * A refund moves through a small state machine:
 *
 *   requested → processing → completed
 *                         ↘ failed  (retryable → back to processing)
 *
 * Only `failed` refunds are retryable; retrying re-enters `processing`. The
 * pure {@link filterRefunds} helper narrows the register by status, initiator
 * and requested-date range and is trivially unit-testable.
 *
 * Shapes owned by the backend:
 *
 *   Refund {
 *     id: string,
 *     initiatedBy: { type: "admin"|"system", label: string },  // who started it
 *     buyer: { id: string, name: string },                     // refunded party
 *     transaction: { id: string, reference: string },          // original purchase
 *     amount: number,
 *     currency: string,                                        // e.g. "USDC"
 *     status: "requested"|"processing"|"completed"|"failed",
 *     requestedAt: string,                                     // ISO 8601
 *     completedAt: string | null,                              // ISO 8601, null until settled
 *     audit: Array<{ at: string, actor: string, note: string }>, // ordered oldest→newest
 *   }
 */

import { withAudit, AUDIT_ACTIONS } from "@/lib/admin/audit";
import axiosInstance from "@/lib/config/axios.config";

/** Base path for the refunds register endpoints. */
const REFUNDS_PATH = "/api/stellar/payment/refunds";

/** Canonical refund status values, in state-machine order. */
export const REFUND_STATUSES = Object.freeze([
  "requested",
  "processing",
  "completed",
  "failed",
]);

/**
 * Best-effort human message from a failed API call: prefer the server's own
 * `message` / `error` envelope, then the client-side error message, then a
 * sensible fallback so the UI never renders `undefined`.
 *
 * @param {unknown} error
 * @param {string} fallback
 * @returns {string}
 */
function apiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || data?.error || error?.message || fallback;
}

/**
 * Normalize the list response into the `{ refunds }` payload the register
 * consumes. Tolerates a bare array body; anything unexpected resolves to an
 * empty register instead of breaking the page.
 *
 * @param {unknown} data
 * @returns {{refunds: Array<object>}}
 */
function normalizeListResponse(data) {
  const refunds = Array.isArray(data) ? data : data?.refunds;
  return { refunds: Array.isArray(refunds) ? refunds : [] };
}

/**
 * Fetch every refund in the register (newest requests first).
 *
 * Backend: GET /api/stellar/payment/refunds
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - 200 → { refunds: Refund[] } using the Refund shape above, ordered by
 *     `requestedAt` descending. Read-only.
 *   - Rejects on API/network failure with a readable message — callers
 *     (hooks/useRefunds) surface it in the page's existing error state.
 *
 * @returns {Promise<{refunds: Array<object>}>}
 */
export async function listRefunds() {
  try {
    const res = await axiosInstance.get(REFUNDS_PATH);
    return normalizeListResponse(res.data);
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Failed to load refunds"));
  }
}

/**
 * Retry a previously failed refund. Re-enters the `processing` state and emits
 * a non-blocking audit event via {@link withAudit} (so the event only fires if
 * the retry actually resolves).
 *
 * Backend: POST /api/stellar/payment/refunds/:refundId/retry
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - Precondition: refund must currently be `failed`; the server re-validates.
 *   - Payload: { reason?: string }
 *   - 200 → { refund: Refund } with `status: "processing"` and an appended
 *     audit entry.
 *   - 409 if the refund is not in a retryable (`failed`) state.
 *
 * @param {string} refundId
 * @param {{ reason?: string }} [context]
 * @returns {Promise<object>} The backend `{ refund }` payload.
 */
export async function retryRefund(refundId, context = {}) {
  const { reason = null } = context;
  return withAudit(
    AUDIT_ACTIONS.REFUND,
    {
      label: `Refund ${refundId}`,
      id: refundId,
      href: `/dashboard/admin/refunds`,
    },
    async () => {
      try {
        const res = await axiosInstance.post(`${REFUNDS_PATH}/${refundId}/retry`, {
          reason,
        });
        return res.data;
      } catch (error) {
        throw new Error(apiErrorMessage(error, "Failed to retry refund"));
      }
    },
    { reason, retry: true }
  );
}

/**
 * Pure filter over the register. Narrows by status, initiator type and an
 * inclusive requested-date range. Any omitted / `"all"` criterion is ignored.
 * No I/O, no mutation of the inputs.
 *
 * @param {Array<object>} refunds
 * @param {{ status?: string, initiator?: string, from?: string, to?: string }} [filters]
 * @returns {Array<object>}
 */
export function filterRefunds(refunds, filters = {}) {
  const list = Array.isArray(refunds) ? refunds : [];
  const { status = "all", initiator = "all", from = "", to = "" } = filters;

  // Interpret the date bounds as inclusive calendar days.
  const fromTime = from ? new Date(`${from}T00:00:00.000Z`).getTime() : null;
  const toTime = to ? new Date(`${to}T23:59:59.999Z`).getTime() : null;

  return list.filter((refund) => {
    if (status !== "all" && refund?.status !== status) return false;
    if (initiator !== "all" && refund?.initiatedBy?.type !== initiator) {
      return false;
    }
    if (fromTime != null || toTime != null) {
      const requestedTime = refund?.requestedAt
        ? new Date(refund.requestedAt).getTime()
        : NaN;
      if (Number.isNaN(requestedTime)) return false;
      if (fromTime != null && requestedTime < fromTime) return false;
      if (toTime != null && requestedTime > toTime) return false;
    }
    return true;
  });
}
