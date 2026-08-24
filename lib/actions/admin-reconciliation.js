/**
 * Admin payout reconciliation service (#285) — READ-ONLY diagnostics.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every fetch in this module currently resolves with mocked data
 * so the reconciliation page can be built and reviewed before the backend
 * endpoints exist. Each function documents the contract it will implement —
 * swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * The tool reconciles two independent views of the same money movement:
 *
 *   1. **Internal transactions** — COMPLETED platform purchases as recorded in
 *      DeenBridge's own database (the source of truth for "what we think
 *      happened").
 *   2. **Settlement claims** — creator settlement claims as observed on-chain
 *      (in production a Horizon/indexer read; the source of truth for "what
 *      actually settled on Stellar").
 *
 * The pure {@link reconcile} function joins the two by `txHash` and classifies
 * every transaction as matched / missing-on-chain / amount-mismatch so an admin
 * can eyeball discrepancies. NOTHING here mutates state — it is strictly a
 * diagnostic read.
 *
 * Shapes owned by the backend:
 *
 *   Transaction {
 *     id: string,
 *     reference: string,        // human-facing platform reference
 *     buyer: string,            // buyer display name / handle
 *     creator: string,          // settling creator display name / handle
 *     amount: number,           // platform-recorded amount
 *     currency: string,         // e.g. "USDC", "XLM"
 *     completedAt: string,      // ISO 8601 timestamp
 *     txHash: string | null,    // on-chain settlement hash, null if never sent
 *   }
 *
 *   SettlementClaim {
 *     txHash: string,
 *     amount: number,           // amount observed on-chain
 *     currency: string,
 *     settledAt: string,        // ISO 8601 timestamp
 *   }
 */

import { config } from "@/lib/config/env";

const MOCK_DELAY_MS = 400;

/** Tolerance for floating-point amount comparison (7 dp, Stellar-ish). */
const AMOUNT_EPSILON = 0.0000001;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Fetch internal COMPLETED platform purchases whose completion date falls in
 * the `[from, to]` range.
 *
 * TODO(backend): GET /api/admin/reconciliation/transactions?from=&to=
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - Query: `from` / `to` are ISO date strings (inclusive day range).
 *   - 200 → { transactions: Transaction[] } using the Transaction shape above.
 *     Only COMPLETED purchases are returned; the endpoint is read-only.
 *   - 403 for staff admins / non-admins.
 *
 * @param {{from: string, to: string}} range
 * @returns {Promise<{transactions: Array<{id: string, reference: string, buyer: string, creator: string, amount: number, currency: string, completedAt: string, txHash: (string|null)}>}>}
 */
export async function fetchInternalTransactions({ from, to } = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/reconciliation/transactions", { params: { from, to } })
  //     .then((res) => res.data);
  void from;
  void to;
  return withMockDelay({
    transactions: [
      {
        id: "txn-1001",
        reference: "PUR-2026-1001",
        buyer: "Amina Yusuf",
        creator: "Ustadh Bilal",
        amount: 25,
        currency: "USDC",
        completedAt: "2026-08-03T09:14:00.000Z",
        // Matches a claim exactly → matched
        txHash: "a1b2c3d4e5f600112233445566778899aabbccddeeff00112233445566778899",
      },
      {
        id: "txn-1002",
        reference: "PUR-2026-1002",
        buyer: "Khalid Rahman",
        creator: "Sr. Maryam",
        amount: 40,
        currency: "USDC",
        completedAt: "2026-08-07T13:40:00.000Z",
        // On-chain claim reports a different amount → amount-mismatch
        txHash: "bb00cc11dd22ee33ff445566778899aabbccddeeff00112233445566778899aa",
      },
      {
        id: "txn-1003",
        reference: "PUR-2026-1003",
        buyer: "Fatima Noor",
        creator: "Ustadh Bilal",
        amount: 15,
        currency: "USDC",
        completedAt: "2026-08-11T18:05:00.000Z",
        // Recorded as completed but never made it on-chain → missing-on-chain
        txHash: null,
      },
      {
        id: "txn-1004",
        reference: "PUR-2026-1004",
        buyer: "Yusuf Ali",
        creator: "Sr. Maryam",
        amount: 120,
        currency: "USDC",
        completedAt: "2026-08-15T08:22:00.000Z",
        // Has a hash but no matching claim in the settlement set → missing-on-chain
        txHash: "cafe00beef11dead22feed33c0de44ba5e55f00d66ba77c088dd99ee00ff1122",
      },
      {
        id: "txn-1005",
        reference: "PUR-2026-1005",
        buyer: "Zaynab Idris",
        creator: "Ustadh Bilal",
        amount: 60,
        currency: "USDC",
        completedAt: "2026-08-19T21:47:00.000Z",
        // Matches a claim exactly → matched
        txHash: "9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0",
      },
    ],
  });
}

/**
 * Fetch creator settlement claims observed on-chain for the `[from, to]` range.
 *
 * TODO(backend): GET /api/admin/reconciliation/claims?from=&to=
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - Query: `from` / `to` are ISO date strings (inclusive day range).
 *   - 200 → { claims: SettlementClaim[] } using the SettlementClaim shape above.
 *   - NOTE: in production this may be a Horizon / indexer read rather than a
 *     database query — the endpoint remains strictly read-only either way.
 *   - 403 for staff admins / non-admins.
 *
 * @param {{from: string, to: string}} range
 * @returns {Promise<{claims: Array<{txHash: string, amount: number, currency: string, settledAt: string}>}>}
 */
export async function fetchSettlementClaims({ from, to } = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/reconciliation/claims", { params: { from, to } })
  //     .then((res) => res.data);
  void from;
  void to;
  return withMockDelay({
    claims: [
      {
        // Matches txn-1001 exactly
        txHash: "a1b2c3d4e5f600112233445566778899aabbccddeeff00112233445566778899",
        amount: 25,
        currency: "USDC",
        settledAt: "2026-08-03T09:15:12.000Z",
      },
      {
        // Matches txn-1002 by hash but the on-chain amount differs (40 vs 38.5)
        txHash: "bb00cc11dd22ee33ff445566778899aabbccddeeff00112233445566778899aa",
        amount: 38.5,
        currency: "USDC",
        settledAt: "2026-08-07T13:41:03.000Z",
      },
      {
        // Matches txn-1005 exactly
        txHash: "9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0",
        amount: 60,
        currency: "USDC",
        settledAt: "2026-08-19T21:48:30.000Z",
      },
    ],
  });
}

/**
 * Pure reconciliation. Joins `transactions` against `claims` by `txHash` and
 * classifies each transaction. No I/O, no mutation of the inputs — trivially
 * unit-testable.
 *
 * Rules:
 *   - No `txHash`, or no claim with a matching `txHash` → `"missing-on-chain"`.
 *   - Matched by hash but `|tx.amount - claim.amount| > AMOUNT_EPSILON`, or the
 *     currencies differ → `"amount-mismatch"`.
 *   - Otherwise → `"matched"`.
 *
 * @param {Array<{id: string, reference: string, buyer: string, creator: string, amount: number, currency: string, completedAt: string, txHash: (string|null)}>} transactions
 * @param {Array<{txHash: string, amount: number, currency: string, settledAt: string}>} claims
 * @returns {Array<{id: string, reference: string, buyer: string, creator: string, amount: number, currency: string, completedAt: string, txHash: (string|null), status: ("matched"|"missing-on-chain"|"amount-mismatch"), onChain: (object|null)}>}
 */
export function reconcile(transactions, claims) {
  const txList = Array.isArray(transactions) ? transactions : [];
  const claimList = Array.isArray(claims) ? claims : [];

  const claimByHash = new Map();
  for (const claim of claimList) {
    if (claim && claim.txHash) claimByHash.set(claim.txHash, claim);
  }

  return txList.map((tx) => {
    const claim = tx?.txHash ? claimByHash.get(tx.txHash) || null : null;

    let status;
    if (!tx?.txHash || !claim) {
      status = "missing-on-chain";
    } else if (
      Math.abs(Number(tx.amount) - Number(claim.amount)) > AMOUNT_EPSILON ||
      tx.currency !== claim.currency
    ) {
      status = "amount-mismatch";
    } else {
      status = "matched";
    }

    return { ...tx, status, onChain: claim };
  });
}

/**
 * Build a stellar.expert explorer URL for a transaction hash, pointed at the
 * network the app is configured for ({@link config.stellarNetwork}). Returns
 * `null` for a null/empty hash so callers can conditionally render the link.
 *
 * @param {string|null|undefined} txHash
 * @returns {string|null}
 */
export function explorerTxUrl(txHash) {
  if (!txHash) return null;
  const segment = config.stellarNetwork === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${segment}/tx/${txHash}`;
}
