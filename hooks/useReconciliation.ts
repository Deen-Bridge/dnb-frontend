"use client";

import { useCallback, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import {
  fetchInternalTransactions,
  fetchSettlementClaims,
  reconcile,
  ReconciledTransaction,
} from "@/lib/actions/admin-reconciliation";
import { adminToastError } from "@/lib/utils/admin-toast";

export interface ReconciliationSummary {
  matched: number;
  missing: number;
  mismatch: number;
  total: number;
}

export interface UseReconciliationRange {
  from?: string;
  to?: string;
}

export interface UseReconciliationResult {
  rows: ReconciledTransaction[];
  summary: ReconciliationSummary;
  isLoading: boolean;
  error: string | null;
  hasRun: boolean;
  from: string;
  to: string;
  setRange: (next?: UseReconciliationRange) => void;
  run: (range?: UseReconciliationRange) => Promise<void>;
}

export default function useReconciliation(initialRange: UseReconciliationRange = {}): UseReconciliationResult {
  const { user, loading: authLoading } = useAuth();

  const [from, setFrom] = useState<string>(initialRange.from || "");
  const [to, setTo] = useState<string>(initialRange.to || "");
  const [rows, setRows] = useState<ReconciledTransaction[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setRange = useCallback((next: UseReconciliationRange = {}) => {
    if (typeof next.from === "string") setFrom(next.from);
    if (typeof next.to === "string") setTo(next.to);
  }, []);

  const run = useCallback(
    async (range?: UseReconciliationRange) => {
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
      } catch (err: any) { // TODO(types): Reconciliation error
        const message = err?.message || "Failed to load reconciliation data";
        setError(message);
        adminToastError({
          title: message,
          action: {
            label: "Retry",
            onClick: () => run({ from: activeFrom, to: activeTo }),
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, user, from, to]
  );

  const summary = useMemo((): ReconciliationSummary => {
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
