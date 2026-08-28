"use client";

import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import { listFlags, createFlag, updateFlag, FeatureFlag, CreateFlagPayload } from "@/lib/actions/admin-flags";
import { adminToastSuccess, adminToastError } from "@/lib/utils/admin-toast";

export interface UseAdminFeatureFlagsResult {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggleFlag: (key: string, enabled: boolean) => Promise<void>;
  setRollout: (key: string, pct: number) => Promise<void>;
  createFlag: (payload: CreateFlagPayload) => Promise<FeatureFlag>;
}

export default function useFeatureFlags(): UseAdminFeatureFlagsResult {
  const { user, loading: authLoading } = useAuth();

  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { flags: list } = await listFlags();
      setFlags(Array.isArray(list) ? list : []);
    } catch (err: any) { // TODO(types): Error shape from listFlags
      setError(err?.message || "Failed to load feature flags");
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
        const { flags: list } = await listFlags();
        if (!cancelled) setFlags(Array.isArray(list) ? list : []);
      } catch (err: any) { // TODO(types): Error shape from listFlags
        if (!cancelled) setError(err?.message || "Failed to load feature flags");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const toggleFlag = useCallback(async (key: string, enabled: boolean) => {
    let previous: boolean | undefined;
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.key !== key) return flag;
        previous = flag.enabled;
        return { ...flag, enabled };
      })
    );
    try {
      await updateFlag(key, { enabled });
      logAuditEvent({
        action: AUDIT_ACTIONS.FLAG_TOGGLE,
        target: { label: `flag: ${key}`, href: null },
        metadata: { key, enabled },
      });
      adminToastSuccess({
        title: enabled ? "Flag enabled" : "Flag disabled",
        action: { label: "Undo", onClick: () => toggleFlag(key, !enabled) },
      });
    } catch (err: any) { // TODO(types): Error from updateFlag
      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key ? { ...flag, enabled: previous ?? !enabled } : flag
        )
      );
      adminToastError({
        title: err?.message || "Couldn't update flag",
        action: { label: "Retry", onClick: () => toggleFlag(key, enabled) },
      });
    }
  }, []);

  const setRollout = useCallback(async (key: string, pct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    let previous: number | undefined;
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.key !== key) return flag;
        previous = flag.rolloutPercentage;
        return { ...flag, rolloutPercentage: clamped };
      })
    );
    try {
      await updateFlag(key, { rolloutPercentage: clamped });
      adminToastSuccess({ title: "Rollout updated" });
    } catch (err: any) { // TODO(types): Error from updateFlag rollout
      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key ? { ...flag, rolloutPercentage: previous ?? 0 } : flag
        )
      );
      adminToastError({
        title: err?.message || "Couldn't update rollout",
        action: { label: "Retry", onClick: () => setRollout(key, pct) },
      });
    }
  }, []);

  const createNewFlag = useCallback(
    async (payload: CreateFlagPayload) => {
      const { flag } = await createFlag(payload);
      await refresh();
      adminToastSuccess({ title: "Flag created" });
      return flag;
    },
    [refresh]
  );

  return {
    flags,
    isLoading,
    error,
    refresh,
    toggleFlag,
    setRollout,
    createFlag: createNewFlag,
  };
}
