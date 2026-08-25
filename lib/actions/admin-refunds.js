/**
 * Admin refunds register service (#282) — status-tracked refund monitoring.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every call resolves with mocked data so the refunds register
 * page can be built and reviewed before the backend endpoints exist. Each
 * function documents the contract it will implement — swap the mock bodies for
 * `axiosInstance` calls (see `lib/config/axios.config.js`) when the backend
 * lands.
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

const MOCK_DELAY_MS = 400;

/** Canonical refund status values, in state-machine order. */
export const REFUND_STATUSES = Object.freeze([
  "requested",
  "processing",
  "completed",
  "failed",
]);

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Fetch every refund in the register (newest requests first).
 *
 * TODO(backend): GET /api/admin/refunds
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - 200 → { refunds: Refund[] } using the Refund shape above, ordered by
 *     `requestedAt` descending. Read-only.
 *   - 403 for staff admins / non-admins.
 *
 * @returns {Promise<{refunds: Array<object>}>}
 */
export async function listRefunds() {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/refunds")
  //     .then((res) => res.data);
  return withMockDelay({
    refunds: [
      {
        id: "rfd-2051",
        initiatedBy: { type: "admin", label: "Ustadh Bilal" },
        buyer: { id: "usr-3001", name: "Amina Yusuf" },
        transaction: { id: "txn-1002", reference: "PUR-2026-1002" },
        amount: 40,
        currency: "USDC",
        status: "failed",
        requestedAt: "2026-08-20T10:12:00.000Z",
        completedAt: null,
        audit: [
          {
            at: "2026-08-20T10:12:00.000Z",
            actor: "Ustadh Bilal",
            note: "Refund requested — buyer reported duplicate charge.",
          },
          {
            at: "2026-08-20T10:13:20.000Z",
            actor: "system",
            note: "Processing started; submitting on-chain reversal.",
          },
          {
            at: "2026-08-20T10:14:05.000Z",
            actor: "system",
            note: "Failed: settlement wallet had insufficient balance.",
          },
        ],
      },
      {
        id: "rfd-2050",
        initiatedBy: { type: "system", label: "Auto-refund" },
        buyer: { id: "usr-3002", name: "Khalid Rahman" },
        transaction: { id: "txn-0997", reference: "PUR-2026-0997" },
        amount: 15,
        currency: "USDC",
        status: "completed",
        requestedAt: "2026-08-18T14:40:00.000Z",
        completedAt: "2026-08-18T14:42:31.000Z",
        audit: [
          {
            at: "2026-08-18T14:40:00.000Z",
            actor: "system",
            note: "Auto-refund triggered — course unpublished within grace window.",
          },
          {
            at: "2026-08-18T14:41:10.000Z",
            actor: "system",
            note: "Processing started.",
          },
          {
            at: "2026-08-18T14:42:31.000Z",
            actor: "system",
            note: "Completed — funds returned to buyer wallet.",
          },
        ],
      },
      {
        id: "rfd-2049",
        initiatedBy: { type: "admin", label: "Sr. Maryam" },
        buyer: { id: "usr-3003", name: "Fatima Noor" },
        transaction: { id: "txn-0990", reference: "PUR-2026-0990" },
        amount: 60,
        currency: "USDC",
        status: "processing",
        requestedAt: "2026-08-22T09:05:00.000Z",
        completedAt: null,
        audit: [
          {
            at: "2026-08-22T09:05:00.000Z",
            actor: "Sr. Maryam",
            note: "Refund requested — content did not match description.",
          },
          {
            at: "2026-08-22T09:06:12.000Z",
            actor: "system",
            note: "Processing started; awaiting on-chain confirmation.",
          },
        ],
      },
      {
        id: "rfd-2048",
        initiatedBy: { type: "admin", label: "Ustadh Bilal" },
        buyer: { id: "usr-3004", name: "Yusuf Ali" },
        transaction: { id: "txn-0985", reference: "PUR-2026-0985" },
        amount: 25,
        currency: "USDC",
        status: "requested",
        requestedAt: "2026-08-24T16:30:00.000Z",
        completedAt: null,
        audit: [
          {
            at: "2026-08-24T16:30:00.000Z",
            actor: "Ustadh Bilal",
            note: "Refund requested — pending review before processing.",
          },
        ],
      },
    ],
  });
}

/**
 * Retry a previously failed refund. Re-enters the `processing` state and emits
 * a non-blocking audit event via {@link withAudit} (so the event only fires if
 * the retry actually resolves).
 *
 * TODO(backend): POST /api/admin/refunds/:refundId/retry
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - Precondition: refund must currently be `failed`; the server re-validates.
 *   - Payload: { reason?: string }
 *   - 200 → { refund: Refund } with `status: "processing"` and an appended
 *     audit entry.
 *   - 409 if the refund is not in a retryable (`failed`) state.
 *
 * @param {string} refundId
 * @param {{ reason?: string }} [context]
 * @returns {Promise<{ refund: { id: string, status: "processing" } }>}
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
    // TODO(backend):
    //   () => axiosInstance
    //     .post(`/api/admin/refunds/${refundId}/retry`, { reason })
    //     .then((res) => res.data),
    () => withMockDelay({ refund: { id: refundId, status: "processing" } }),
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
