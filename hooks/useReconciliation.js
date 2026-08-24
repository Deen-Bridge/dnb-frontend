"use client";
/**
 * useReconciliation — data hook for the payout reconciliation page (#285).
 * ------------------------------------------------------------------------
 * Holds the `{ from, to }` date range and, on `run()`, fetches both the
 * internal transaction view and the on-chain settlement-claim view for that
 * range, then computes the pure {@link reconcile} join. Mirrors
 * `useAdminTeam`: local state + explicit trigger, guarded by auth + admin tier.
 *
 * **Read-only.** There are no mutations here — the hook only reads and derives.
 *
 * **Fails closed.** Nothing is fetched until auth has resolved to a user who
 * passes `canManageTeam`; the page-level guard (`AdminTierGuard`) owns the
 * rendering decision — this hook just refuses to fetch without one.
 */
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import {
  fetchInternalTransactions,
  fetchSettlementClaims,
  reconcile,
} from "@/lib/actions/admin-reconciliation";

/**
 * @typedef {Object} ReconciliationSummary
 * @property {number} matched   Count of rows that matched on-chain exactly.
 * @property {number} missing   Count of rows missing an on-chain settlement.
 * @property {number} mismatch  Count of rows whose amount/currency disagreed.
 * @property {number} total     Total transactions reconciled.
 */

/**
 * @param {{from?: string, to?: string}} [initialRange]
 */
export default function useReconciliation(initialRange = {}) {
  const { user, loading: authLoading } = useAuth();

  const [from, setFrom] = useState(initialRange.from || "");
  const [to, setTo] = useState(initialRange.to || "");
  const [rows, setRows] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Update the active date range (does not fetch). */
  const setRange = useCallback((next = {}) => {
    if (typeof next.from === "string") setFrom(next.from);
    if (typeof next.to === "string") setTo(next.to);
  }, []);

  /**
   * Fetch both sources for the current (or supplied) range and reconcile them.
   * Read-only; surfaces load failures via a toast and the `error` state.
   */
  const run = useCallback(
    async (range) => {
      const activeFrom = range?.from ?? from;
      const activeTo = range?.to ?? to;

      if (authLoading) return;
      if (!user || !canManageTeam(user)) {
        setError("You do not have permission to run reconciliation.");
        return;
      }
      if (!activeFrom || !activeTo) {
        setError("Choose a start and end date to reconcile.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [{ transactions }, { claims }] = await Promise.all([
          fetchInternalTransactions({ from: activeFrom, to: activeTo }),
          fetchSettlementClaims({ from: activeFrom, to: activeTo }),
        ]);
        setRows(reconcile(transactions, claims));
        setHasRun(true);
      } catch (err) {
        const message = err?.message || "Failed to load reconciliation data";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, user, from, to]
  );

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "matched") acc.matched += 1;
        else if (row.status === "missing-on-chain") acc.missing += 1;
        else if (row.status === "amount-mismatch") acc.mismatch += 1;
        return acc;
      },
      { matched: 0, missing: 0, mismatch: 0, total: 0 }
    );
  }, [rows]);

  return {
    rows,
    summary,
    isLoading,
    error,
    hasRun,
    from,
    to,
    setRange,
    run,
  };
}
