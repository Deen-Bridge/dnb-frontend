"use client";
/**
 * useAdminTeam — data hook for the admin-team management page (#315).
 * ------------------------------------------------------------------
 * Loads the member list via the stubbed service in `lib/actions/admin-team`
 * (same shape as `usePurchases`: local state + effect + explicit refresh) and
 * exposes the invite/demote/revoke mutations.
 *
 * **Fails closed.** The list is only fetched once auth has resolved to a user
 * who passes `canManageTeam`; the page-level guard (`AdminTierGuard`) owns
 * rendering decisions — this hook just refuses to fetch without one.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  listAdmins,
  createInvite,
  demoteAdmin,
  revokeAdmin,
} from "@/lib/actions/admin-team";

export default function useAdminTeam() {
  const { user, loading: authLoading } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { admins: members } = await listAdmins();
      setAdmins(Array.isArray(members) ? members : []);
    } catch (err) {
      setError(err?.message || "Failed to load admin team");
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
        const { admins: members } = await listAdmins();
        if (!cancelled) setAdmins(Array.isArray(members) ? members : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load admin team");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /**
   * Create an invite via the stubbed service. Resolves
   * `{ invite: { token, url, expiresAt } }` or throws for the caller to show.
   */
  const inviteAdmin = useCallback(async (options) => {
    const { invite } = await createInvite(options);
    return invite;
  }, []);

  /** Demote a super-admin to staff; updates the local list on success. */
  const demoteMember = useCallback(async (adminId, context) => {
    await demoteAdmin(adminId, context);
    setAdmins((prev) =>
      prev.map((m) => (m.id === adminId ? { ...m, tier: "staff" } : m))
    );
    // Fire-and-forget audit trail — never awaited, never blocks the UI.
    logAuditEvent({
      action: AUDIT_ACTIONS.ROLE_DEMOTE,
      target: {
        label: adminId,
        id: adminId,
        href: `/dashboard/admin/team`,
      },
      metadata: { to: "staff", confirmation: context?.confirmation },
    });
    toast.success("Admin demoted to staff");
  }, []);

  /** Remove a member's admin access; removes them from the local list. */
  const revokeMember = useCallback(async (adminId, context) => {
    await revokeAdmin(adminId, context);
    setAdmins((prev) => prev.filter((m) => m.id !== adminId));
    // Fire-and-forget audit trail — never awaited, never blocks the UI.
    logAuditEvent({
      action: AUDIT_ACTIONS.ROLE_REVOKE,
      target: {
        label: adminId,
        id: adminId,
        href: `/dashboard/admin/team`,
      },
      metadata: { confirmation: context?.confirmation },
    });
    toast.success("Admin access revoked");
  }, []);

  return {
    admins,
    isLoading,
    error,
    refresh,
    inviteAdmin,
    demoteMember,
    revokeMember,
  };
}
