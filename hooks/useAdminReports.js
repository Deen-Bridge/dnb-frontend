"use client";
/**
 * useAdminReports — data hook for the report-dismissal queue (#293).
 * ------------------------------------------------------------------
 * Keeps the page focused on rendering and form state while enforcing the
 * super-admin boundary before report data or mutations are requested.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { dismissReport, listReports } from "@/lib/actions/admin-reports";

export default function useAdminReports() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDismissing, setIsDismissing] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { reports: nextReports } = await listReports();
      setReports(Array.isArray(nextReports) ? nextReports : []);
    } catch (err) {
      setError(err?.message || "Failed to load reports");
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
        const { reports: nextReports } = await listReports();
        if (!cancelled) setReports(Array.isArray(nextReports) ? nextReports : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load reports");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const dismiss = useCallback(async (options) => {
    setIsDismissing(true);
    try {
      const result = await dismissReport(options);
      setReports((current) => current.filter((report) => report.id !== options.reportId));
      toast.success("Report dismissed");
      return result;
    } catch (err) {
      toast.error(err?.message || "Failed to dismiss report");
      throw err;
    } finally {
      setIsDismissing(false);
    }
  }, []);

  return { reports, isLoading, isDismissing, error, refresh, dismiss };
}
