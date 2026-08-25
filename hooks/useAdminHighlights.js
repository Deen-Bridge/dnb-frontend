"use client";
/**
 * useAdminHighlights — admin hook for feature highlights management (#304)
 * ------------------------------------------------------------------------
 * Provides CRUD operations for feature highlights from the admin interface.
 * Follows the same pattern as useFeatureFlags for consistency.
 *
 * Features:
 * - Load all highlights (including disabled)
 * - Create, update, delete highlights
 * - Toggle enabled state
 * - Optimistic updates with rollback on failure
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  listAllHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  toggleHighlight,
  reorderHighlights,
} from "@/lib/actions/admin-highlights";

export default function useAdminHighlights() {
  const { user, loading: authLoading } = useAuth();

  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { highlights: list } = await listAllHighlights();
      setHighlights(Array.isArray(list) ? list : []);
    } catch (err) {
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
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load feature highlights");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /**
   * Toggle a highlight's enabled state optimistically
   */
  const toggle = useCallback(async (id, enabled) => {
    let previous;
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
    } catch (err) {
      // Revert on failure
      setHighlights((prev) =>
        prev.map((h) => (h.id === id ? { ...h, enabled: previous } : h))
      );
      toast.error(err?.message || `Couldn't update "${id}"`);
    }
  }, []);

  /**
   * Create a new highlight
   */
  const create = useCallback(
    async (payload) => {
      const { highlight } = await createHighlight(payload);
      await refresh();
      toast.success(`Highlight "${highlight.id}" created`);
      logAuditEvent({
        action: AUDIT_ACTIONS.SETTINGS_CHANGE,
        target: { label: `highlight: ${highlight.id}`, href: null },
        metadata: { action: "create", ...payload },
      });
      return highlight;
    },
    [refresh]
  );

  /**
   * Update an existing highlight
   */
  const update = useCallback(async (id, updates) => {
    let previous;
    setHighlights((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        previous = { ...h };
        return { ...h, ...updates };
      })
    );

    try {
      const { highlight } = await updateHighlight(id, updates);
      toast.success(`Highlight "${id}" updated`);
      return highlight;
    } catch (err) {
      // Revert on failure
      if (previous) {
        setHighlights((prev) =>
          prev.map((h) => (h.id === id ? previous : h))
        );
      }
      toast.error(err?.message || `Couldn't update "${id}"`);
      throw err;
    }
  }, []);

  /**
   * Delete a highlight
   */
  const remove = useCallback(async (id) => {
    const previous = highlights.find((h) => h.id === id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));

    try {
      await deleteHighlight(id);
      toast.success(`Highlight "${id}" deleted`);
      logAuditEvent({
        action: AUDIT_ACTIONS.SETTINGS_CHANGE,
        target: { label: `highlight: ${id}`, href: null },
        metadata: { action: "delete" },
      });
    } catch (err) {
      // Revert on failure
      if (previous) {
        setHighlights((prev) => [...prev, previous]);
      }
      toast.error(err?.message || `Couldn't delete "${id}"`);
      throw err;
    }
  }, [highlights]);

  /**
   * Reorder highlights by priority
   */
  const reorder = useCallback(async (order) => {
    const previous = [...highlights];

    // Optimistic update
    setHighlights((prev) =>
      prev.map((h) => {
        const item = order.find((o) => o.id === h.id);
        return item ? { ...h, priority: item.priority } : h;
      })
    );

    try {
      await reorderHighlights(order);
      toast.success("Highlights reordered");
    } catch (err) {
      // Revert on failure
      setHighlights(previous);
      toast.error(err?.message || "Couldn't reorder highlights");
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
