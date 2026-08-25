"use client";
/**
 * useRefunds — data hook for the admin refunds register page (#282).
 * ------------------------------------------------------------------
 * Loads the refund register via the stubbed service in `lib/actions/admin-refunds`
 * (same shape as `useAdminTeam`: local state + effect + explicit refresh) and
 * exposes the retry mutation for failed refunds. Holds the client-side filter
 * state (status / initiator / requested-date range) and derives the filtered
 * rows plus a per-status count summary.
 *
 * **Fails closed.** The register is only fetched once auth has resolved to a
 * user who passes `canManageTeam`; the page-level guard (`AdminTierGuard`) owns
 * rendering decisions — this hook just refuses to fetch without one.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import {
  listRefunds,
  retryRefund,
  filterRefunds,
  REFUND_STATUSES,
} from "@/lib/actions/admin-refunds";

/**
 * @typedef {Object} RefundsSummary
 * @property {number} requested
 * @property {number} processing
 * @property {number} completed
 * @property {number} failed
 * @property {number} total     Total refunds in the (unfiltered) register.
 */

export default function useRefunds() {
  const { user, loading: authLoading } = useAuth();

  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  // Client-side filters.
  const [status, setStatus] = useState("all");
  const [initiator, setInitiator] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { refunds: list } = await listRefunds();
      setRefunds(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load refunds");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canManageTeam(user)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { refunds: list } = await listRefunds();
        if (!cancelled) setRefunds(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load refunds");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /**
   * Retry a failed refund. Optimistically moves the row to `processing` and
   * appends an audit entry; rolls back and toasts on failure.
   */
  const retry = useCallback(async (refundId, context) => {
    setRetryingId(refundId);
    const previous = refunds;
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: "processing",
              audit: [
                ...(Array.isArray(r.audit) ? r.audit : []),
                {
                  at: new Date().toISOString(),
                  actor: "admin",
                  note: "Retry requested — re-entering processing.",
                },
              ],
            }
          : r
      )
    );
    try {
      await retryRefund(refundId, context);
      toast.success("Refund retry started");
    } catch (err) {
      setRefunds(previous);
      toast.error(err?.message || "Failed to retry refund");
    } finally {
      setRetryingId(null);
    }
  }, [refunds]);

  const filters = useMemo(
    () => ({ status, initiator, from, to }),
    [status, initiator, from, to]
  );

  const filteredRefunds = useMemo(
    () => filterRefunds(refunds, filters),
    [refunds, filters]
  );

  const summary = useMemo(() => {
    const base = REFUND_STATUSES.reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      { total: 0 }
    );
    return refunds.reduce((acc, refund) => {
      acc.total += 1;
      if (acc[refund?.status] != null) acc[refund.status] += 1;
      return acc;
    }, base);
  }, [refunds]);

  const resetFilters = useCallback(() => {
    setStatus("all");
    setInitiator("all");
    setFrom("");
    setTo("");
  }, []);

  return {
    refunds: filteredRefunds,
    summary,
    isLoading,
    error,
    retryingId,
    // filter state + setters
    status,
    setStatus,
    initiator,
    setInitiator,
    from,
    setFrom,
    to,
    setTo,
    resetFilters,
    // actions
    refresh,
    retry,
  };
}
