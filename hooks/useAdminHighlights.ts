"use client";

import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import { adminToastSuccess, adminToastError } from "@/lib/utils/admin-toast";
import {
  listAllHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  toggleHighlight,
  reorderHighlights,
  FeatureHighlight,
  CreateHighlightPayload,
} from "@/lib/actions/admin-highlights";

export interface UseAdminHighlightsResult {
  highlights: FeatureHighlight[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
  create: (payload: CreateHighlightPayload) => Promise<FeatureHighlight>;
  update: (id: string, updates: Partial<Omit<FeatureHighlight, "id">>) => Promise<FeatureHighlight>;
  remove: (id: string) => Promise<void>;
  reorder: (order: Array<{ id: string; priority: number }>) => Promise<void>;
}

export default function useAdminHighlights(): UseAdminHighlightsResult {
  const { user, loading: authLoading } = useAuth();

  const [highlights, setHighlights] = useState<FeatureHighlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { highlights: list } = await listAllHighlights();
      setHighlights(Array.isArray(list) ? list : []);
    } catch (err: any) { // TODO(types): Error shape from listAllHighlights
      setError(err?.message || "Failed to load feature highlights");
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
        const { highlights: list } = await listAllHighlights();
        if (!cancelled) setHighlights(Array.isArray(list) ? list : []);
      } catch (err: any) { // TODO(types): Error shape from listAllHighlights
        if (!cancelled) setError(err?.message || "Failed to load feature highlights");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    let previous: boolean | undefined;
    setHighlights((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        previous = h.enabled;
        return { ...h, enabled };
      })
    );

    try {
      await toggleHighlight(id, enabled);
      logAuditEvent({
        action: AUDIT_ACTIONS.SETTINGS_CHANGE,
        target: { label: `highlight: ${id}`, href: null },
        metadata: { id, enabled },
      });
      adminToastSuccess({
        title: enabled ? "Highlight shown" : "Highlight hidden",
        action: { label: "Undo", onClick: () => toggle(id, !enabled) },
      });
    } catch (err: any) { // TODO(types): Error shape from toggleHighlight
      setHighlights((prev) =>
        prev.map((h) => (h.id === id ? { ...h, enabled: previous ?? !enabled } : h))
      );
      adminToastError({
        title: err?.message || "Couldn't update highlight",
        action: { label: "Retry", onClick: () => toggle(id, enabled) },
      });
    }
  }, []);

  const create = useCallback(
    async (payload: CreateHighlightPayload) => {
      const { highlight } = await createHighlight(payload);
      await refresh();
      adminToastSuccess({ title: "Highlight created" });
      logAuditEvent({
        action: AUDIT_ACTIONS.SETTINGS_CHANGE,
        target: { label: `highlight: ${highlight.id}`, href: null },
        metadata: { action: "create", ...payload },
      });
      return highlight;
    },
    [refresh]
  );

  const update = useCallback(async (id: string, updates: Partial<Omit<FeatureHighlight, "id">>) => {
    let previous: FeatureHighlight | undefined;
    setHighlights((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        previous = { ...h };
        return { ...h, ...updates };
      })
    );

    try {
      const { highlight } = await updateHighlight(id, updates);
      adminToastSuccess({ title: "Highlight updated" });
      return highlight;
    } catch (err: any) { // TODO(types): Error shape from updateHighlight
      if (previous) {
        setHighlights((prev) =>
          prev.map((h) => (h.id === id ? previous! : h))
        );
      }
      adminToastError({
        title: err?.message || "Couldn't update highlight",
        action: { label: "Retry", onClick: () => update(id, updates) },
      });
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    const previous = highlights.find((h) => h.id === id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));

    try {
      await deleteHighlight(id);
      adminToastSuccess({ title: "Highlight deleted" });
      logAuditEvent({
        action: AUDIT_ACTIONS.SETTINGS_CHANGE,
        target: { label: `highlight: ${id}`, href: null },
        metadata: { action: "delete" },
      });
    } catch (err: any) { // TODO(types): Error shape from deleteHighlight
      if (previous) {
        setHighlights((prev) => [...prev, previous]);
      }
      adminToastError({
        title: err?.message || "Couldn't delete highlight",
        action: { label: "Retry", onClick: () => remove(id) },
      });
      throw err;
    }
  }, [highlights]);

  const reorder = useCallback(async (order: Array<{ id: string; priority: number }>) => {
    const previous = [...highlights];

    setHighlights((prev) =>
      prev.map((h) => {
        const item = order.find((o) => o.id === h.id);
        return item ? { ...h, priority: item.priority } : h;
      })
    );

    try {
      await reorderHighlights(order);
      adminToastSuccess({ title: "Highlights reordered" });
    } catch (err: any) { // TODO(types): Error shape from reorderHighlights
      setHighlights(previous);
      adminToastError({
        title: err?.message || "Couldn't reorder highlights",
        action: { label: "Retry", onClick: () => reorder(order) },
      });
      throw err;
    }
  }, [highlights]);

  return {
    highlights,
    isLoading,
    error,
    refresh,
    toggle,
    create,
    update,
    remove,
    reorder,
  };
}
