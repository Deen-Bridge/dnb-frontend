"use client";

import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  listAdmins,
  createInvite,
  demoteAdmin,
  revokeAdmin,
  AdminMember,
  CreateInviteOptions,
  CreateInviteResult,
  DemoteContext,
  RevokeContext,
} from "@/lib/actions/admin-team";
import { adminToastSuccess } from "@/lib/utils/admin-toast";

export interface UseAdminTeamResult {
  admins: AdminMember[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  inviteAdmin: (options?: CreateInviteOptions) => Promise<CreateInviteResult["invite"]>;
  demoteMember: (adminId: string, context?: DemoteContext) => Promise<void>;
  revokeMember: (adminId: string, context?: RevokeContext) => Promise<void>;
}

export default function useAdminTeam(): UseAdminTeamResult {
  const { user, loading: authLoading } = useAuth();

  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { admins: members } = await listAdmins();
      setAdmins(Array.isArray(members) ? members : []);
    } catch (err: any) { // TODO(types): Error shape from listAdmins
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
      } catch (err: any) { // TODO(types): Error shape from listAdmins
        if (!cancelled) setError(err?.message || "Failed to load admin team");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const inviteAdmin = useCallback(async (options?: CreateInviteOptions) => {
    const { invite } = await createInvite(options);
    return invite;
  }, []);

  const demoteMember = useCallback(async (adminId: string, context?: DemoteContext) => {
    await demoteAdmin(adminId, context);
    setAdmins((prev) =>
      prev.map((m) => (m.id === adminId ? { ...m, tier: "staff" } : m))
    );
    logAuditEvent({
      action: AUDIT_ACTIONS.ROLE_DEMOTE,
      target: {
        label: adminId,
        id: adminId,
        href: `/dashboard/admin/team`,
      },
      metadata: { to: "staff", confirmation: context?.confirmation },
    });
    adminToastSuccess({ title: "Admin demoted to staff" });
  }, []);

  const revokeMember = useCallback(async (adminId: string, context?: RevokeContext) => {
    await revokeAdmin(adminId, context);
    setAdmins((prev) => prev.filter((m) => m.id !== adminId));
    logAuditEvent({
      action: AUDIT_ACTIONS.ROLE_REVOKE,
      target: {
        label: adminId,
        id: adminId,
        href: `/dashboard/admin/team`,
      },
      metadata: { confirmation: context?.confirmation },
    });
    adminToastSuccess({ title: "Admin access revoked" });
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
