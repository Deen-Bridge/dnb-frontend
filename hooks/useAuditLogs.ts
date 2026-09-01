"use client";

import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { listAuditLogs, listActors, AuditLogEntry, AuditActor } from "@/lib/actions/admin-audit";

export interface AuditFilters {
  actor: string;
  category: string;
  from: string;
  to: string;
}

const DEFAULT_FILTERS: AuditFilters = { actor: "all", category: "all", from: "", to: "" };
const DEFAULT_PAGE_SIZE = 20;

export interface UseAuditLogsOptions {
  pageSize?: number;
}

export interface UseAuditLogsResult {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  filters: AuditFilters;
  actors: AuditActor[];
  isLoading: boolean;
  error: string | null;
  setFilters: (next: Partial<AuditFilters>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

export default function useAuditLogs({ pageSize = DEFAULT_PAGE_SIZE }: UseAuditLogsOptions = {}): UseAuditLogsResult {
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPageState] = useState<number>(1);
  const [filters, setFiltersState] = useState<AuditFilters>(DEFAULT_FILTERS);
  const [actors, setActors] = useState<AuditActor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const canView = !authLoading && !!user && canManageTeam(user);

  const setFilters = useCallback((next: Partial<AuditFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPageState(1);
  }, []);

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, Number(next) || 1));
  }, []);

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

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
      } catch (err: any) { // TODO(types): Error shape from listAuditLogs
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
