"use client";
/**
 * useMaintenanceMode — admin data hook for platform-wide maintenance (#303).
 * ---------------------------------------------------------------------------
 * Loads the maintenance state via the stubbed service in
 * `lib/actions/admin-maintenance` and exposes the toggle/save mutations the
 * admin settings page and the `MaintenanceGate` admin bar share, so both drive
 * one code path and stay consistent.
 *
 * **Fails closed.** The state is only fetched once auth has resolved to a user
 * with the admin role (staff or super). The settings *page* is additionally
 * restricted to super-admins by its `AdminTierGuard`; this hook only refuses to
 * fetch for non-admins. Every mutation stamps the acting admin as `updatedBy`.
 *
 * NOTE: this is the *management* hook. The gate reads the public state itself
 * (for logged-out/learner visitors) — it uses this hook only for the admin bar.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { normalizeRole, ROLES } from "@/lib/auth/roles";
import {
  getMaintenanceState,
  setMaintenanceState,
} from "@/lib/actions/admin-maintenance";

/** Whether the user holds the admin role (any tier). Fails closed. */
function isAdminUser(user) {
  return Boolean(user) && normalizeRole(user.role) === ROLES.ADMIN;
}

/** Build the `updatedBy` actor descriptor the stub stamps onto writes. */
function toActor(user) {
  if (!user) return null;
  return {
    id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? user.fullName ?? "Admin"),
  };
}

export default function useMaintenanceMode() {
  const { user, loading: authLoading } = useAuth();

  const [maintenance, setMaintenance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { maintenance: state } = await getMaintenanceState();
      setMaintenance(state);
      return state;
    } catch (err) {
      setError(err?.message || "Failed to load maintenance state");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!isAdminUser(user)) {
      setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { maintenance: state } = await getMaintenanceState();
        if (!cancelled) setMaintenance(state);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load maintenance state");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /**
   * Write maintenance state. Stamps the acting admin, updates local state with
   * the server echo, and surfaces failures via toast (re-throwing so callers
   * can keep a dialog open / revert UI).
   *
   * @param {{enabled: boolean, message?: string|null, etaAt?: string|null}} payload
   */
  const setState = useCallback(
    async (payload) => {
      setIsSaving(true);
      try {
        const { maintenance: next } = await setMaintenanceState({
          ...payload,
          actor: toActor(user),
        });
        setMaintenance(next);
        return next;
      } catch (err) {
        toast.error(err?.message || "Couldn't update maintenance mode");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  /**
   * Turn maintenance ON, optionally with a custom message and ETA.
   *
   * @param {{message?: string|null, etaAt?: string|null}} [payload]
   */
  const enable = useCallback(
    async (payload = {}) => {
      const next = await setState({ enabled: true, ...payload });
      toast.success("Maintenance mode enabled");
      return next;
    },
    [setState]
  );

  /** Turn maintenance OFF, preserving the stored message/ETA. */
  const disable = useCallback(async () => {
    const next = await setState({ enabled: false });
    toast.success("Maintenance mode disabled");
    return next;
  }, [setState]);

  return {
    maintenance,
    isLoading,
    isSaving,
    error,
    enable,
    disable,
    setState,
    refresh,
  };
}
