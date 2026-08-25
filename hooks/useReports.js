"use client";
/**
 * useReports — data hook for the admin moderation-reports surface (#289).
 * ---------------------------------------------------------------------------
 * Loads the moderation queue and single reports from the stubbed service in
 * `lib/actions/admin-reports`, and exposes the three moderator actions
 * (escalate / dismiss / apply-action-to-target) with `sonner` toasts and an
 * optimistic local update so the list and the open drawer reflect a decision
 * immediately. The page and the detail drawer share one hook instance so they
 * never drift.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listReports,
  escalateReport,
  dismissReport,
  applyActionToTarget,
} from "@/lib/actions/admin-reports";

export default function useReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const { reports: list } = await listReports();
      setReports(list);
      return list;
    } catch (err) {
      setError(err?.message || "Failed to load reports");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const { reports: list } = await listReports();
        if (!cancelled) setReports(list);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load reports");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Run a mutation, drop the resolved report out of the queue optimistically,
   * and toast the outcome. `run` returns `{ report }`.
   */
  const mutate = useCallback(
    async (id, run, { pending, success, failure }) => {
      setPendingId(id);
      const toastId = toast.loading(pending);
      try {
        const { report } = await run();
        if (!report) throw new Error("Report not found");
        // The queue holds only open/escalated reports: update the status in place,
        // then drop anything now resolved (dismissed / actioned) out of the list.
        setReports((prev) =>
          prev
            .map((r) => (r.id === id ? { ...r, status: report.status } : r))
            .filter((r) => r.status === "open" || r.status === "escalated")
        );
        toast.success(success, { id: toastId });
        return report;
      } catch (err) {
        toast.error(err?.message || failure, { id: toastId });
        throw err;
      } finally {
        setPendingId(null);
      }
    },
    []
  );

  const escalate = useCallback(
    (id) =>
      mutate(id, () => escalateReport(id), {
        pending: "Escalating report…",
        success: "Report escalated for senior review",
        failure: "Could not escalate report",
      }),
    [mutate]
  );

  const dismiss = useCallback(
    (id, reason) =>
      mutate(id, () => dismissReport(id, { reason }), {
        pending: "Dismissing report…",
        success: "Report dismissed",
        failure: "Could not dismiss report",
      }),
    [mutate]
  );

  const applyAction = useCallback(
    (id, action, reason) =>
      mutate(id, () => applyActionToTarget(id, { action, reason }), {
        pending: "Applying action to target…",
        success: "Action applied to target",
        failure: "Could not apply action",
      }),
    [mutate]
  );

  return {
    reports,
    isLoading,
    error,
    pendingId,
    refresh,
    escalate,
    dismiss,
    applyAction,
  };
}
