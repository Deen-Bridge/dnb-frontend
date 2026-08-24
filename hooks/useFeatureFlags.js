"use client";
/**
 * useFeatureFlags — data hook for the flags management page (#313).
 * ------------------------------------------------------------------
 * Loads the flag list via the stubbed service in `lib/actions/admin-flags`
 * (same shape as `useAdminTeam`: local state + effect + explicit refresh) and
 * exposes the toggle / rollout / create mutations the admin UI drives.
 *
 * **Fails closed.** The list is only fetched once auth has resolved to a user
 * who passes the admin tier check; the page-level guard (`AdminTierGuard`) owns
 * the render decision — this hook just refuses to fetch without one.
 *
 * NOTE: this is the *management* hook. App code that merely *consumes* a flag
 * should use `useFeatureFlag(key)` from
 * `@/components/providers/FeatureFlagProvider`, not this hook.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import { listFlags, createFlag, updateFlag } from "@/lib/actions/admin-flags";

export default function useFeatureFlags() {
  const { user, loading: authLoading } = useAuth();

  const [flags, setFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { flags: list } = await listFlags();
      setFlags(Array.isArray(list) ? list : []);
    } catch (err) {
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
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load feature flags");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /**
   * Toggle a flag on/off **optimistically**: the local state flips immediately
   * so the switch feels instant, then the mutation runs. On failure we revert
   * to the previous value and surface a toast.
   *
   * @param {string} key
   * @param {boolean} enabled desired next state
   */
  const toggleFlag = useCallback(async (key, enabled) => {
    let previous;
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.key !== key) return flag;
        previous = flag.enabled;
        return { ...flag, enabled };
      })
    );
    try {
      await updateFlag(key, { enabled });
    } catch (err) {
      // Revert on failure.
      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key ? { ...flag, enabled: previous } : flag
        )
      );
      toast.error(err?.message || `Couldn't update "${key}"`);
    }
  }, []);

  /**
   * Set a flag's rollout percentage **optimistically** with revert-on-failure,
   * mirroring {@link toggleFlag}.
   *
   * @param {string} key
   * @param {number} pct 0-100
   */
  const setRollout = useCallback(async (key, pct) => {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    let previous;
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.key !== key) return flag;
        previous = flag.rolloutPercentage;
        return { ...flag, rolloutPercentage: clamped };
      })
    );
    try {
      await updateFlag(key, { rolloutPercentage: clamped });
    } catch (err) {
      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key ? { ...flag, rolloutPercentage: previous } : flag
        )
      );
      toast.error(err?.message || `Couldn't update rollout for "${key}"`);
    }
  }, []);

  /**
   * Create a flag, then refresh the list so the new row appears with the
   * server-assigned defaults. Resolves the created flag or throws for the
   * caller (the create form) to handle inline.
   *
   * @param {{key: string, description: string, rolloutPercentage?: number, critical?: boolean}} payload
   */
  const createNewFlag = useCallback(
    async (payload) => {
      const { flag } = await createFlag(payload);
      await refresh();
      toast.success(`Flag "${flag.key}" created`);
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
