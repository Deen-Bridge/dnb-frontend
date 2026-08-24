"use client";
/**
 * useAuditLogs — data hook for the admin audit-log viewer (#308).
 * ------------------------------------------------------------------
 * Loads audit entries via the stubbed service in `lib/actions/admin-audit`
 * (same shape as `useAdminTeam`: local state + effect + explicit refresh) with
 * **server-side** filtering and pagination — the hook only ever holds the
 * current page of rows plus the total matching count, and re-fetches whenever
 * the filters or page change.
 *
 * **Fails closed.** Logs are only fetched once auth has resolved to a user who
 * passes `canManageTeam` (super-admin); the page-level guard
 * (`AdminTierGuard`) owns rendering decisions — this hook just refuses to fetch
 * without one.
 */
import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { listAuditLogs, listActors } from "@/lib/actions/admin-audit";

const DEFAULT_FILTERS = { actor: "all", category: "all", from: "", to: "" };
const DEFAULT_PAGE_SIZE = 20;

/**
 * @param {object} [options]
 * @param {number} [options.pageSize=20] Rows per page (server-side slice size).
 * @returns {{
 *   logs: Array<object>,
 *   total: number,
 *   page: number,
 *   pageSize: number,
 *   filters: {actor: string, category: string, from: string, to: string},
 *   actors: Array<{id: string, name: string}>,
 *   isLoading: boolean,
 *   error: string|null,
 *   setFilters: (next: object) => void,
 *   setPage: (page: number) => void,
 *   refresh: () => void,
 * }}
 */
export default function useAuditLogs({ pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [actors, setActors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bumped by `refresh()` to force a re-fetch without changing filters/page.
  const [reloadKey, setReloadKey] = useState(0);

  const canView = !authLoading && !!user && canManageTeam(user);

  /**
   * Merge a partial filter change and reset to page 1 (a new filter set means
   * the old page offset is meaningless).
   */
  const setFilters = useCallback((next) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPageState(1);
  }, []);

  /** Jump to a specific 1-based page. */
  const setPage = useCallback((next) => {
    setPageState(Math.max(1, Number(next) || 1));
  }, []);

  /** Force a re-fetch of the current page/filters. */
  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  // Load the actor dropdown options once the user is allowed to view.
  useEffect(() => {
    if (!canView) return;
    let cancelled = false;
    (async () => {
      try {
        const { actors: list } = await listActors();
        if (!cancelled) setActors(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setActors([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canView]);

  // Fetch the current page whenever filters/page/auth change (or on refresh).
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
        const result = await listAuditLogs({
          actor: filters.actor,
          category: filters.category,
          from: filters.from,
          to: filters.to,
          page,
          pageSize,
        });
        if (!cancelled) {
          setLogs(Array.isArray(result.logs) ? result.logs : []);
          setTotal(Number(result.total) || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load audit logs");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, filters, page, pageSize, reloadKey]);

  return {
    logs,
    total,
    page,
    pageSize,
    filters,
    actors,
    isLoading,
    error,
    setFilters,
    setPage,
    refresh,
  };
}
