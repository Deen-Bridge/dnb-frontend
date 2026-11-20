"use client";
/**
 * useDigestConfig — data hook for the scheduled digests configuration page (#306).
 * ---------------------------------------------------------------------------
 * Loads the digest configuration via the stubbed service in
 * `lib/actions/admin-digests` (same shape as `useFeatureFlags`/`useAdminTeam`:
 * local state + effect + explicit refresh) and holds an **editable local draft**
 * the admin mutates through the exposed helpers before an explicit `save`.
 *
 * **Fails closed.** The config is only fetched once auth has resolved to a user
 * who passes the admin tier check; the page-level guard (`AdminTierGuard`) owns
 * the render decision — this hook just refuses to fetch without one.
 *
 * `save` runs `validateDigestConfig` first and blocks + toasts on invalid input
 * so a malformed cron-ish selection never reaches the (stubbed) backend.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { canManageTeam } from "@/lib/auth/admin-tiers";
import {
  getDigestConfig,
  updateDigestConfig,
  validateDigestConfig,
} from "@/lib/actions/admin-digests";

export default function useDigestConfig() {
  const { user, loading: authLoading } = useAuth();

  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { config: loaded } = await getDigestConfig();
      setConfig(loaded);
    } catch (err) {
      setError(err?.message || "Failed to load digest configuration");
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
        const { config: loaded } = await getDigestConfig();
        if (!cancelled) setConfig(loaded);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load digest configuration");
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
   * Toggle one digest type on/off in the local draft.
   * @param {"moderation"|"revenue"|"signups"} type
   */
  const toggleDigest = useCallback((type) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const current = Boolean(prev.digests?.[type]?.enabled);
      return {
        ...prev,
        digests: {
          ...prev.digests,
          [type]: { ...prev.digests?.[type], enabled: !current },
        },
      };
    });
  }, []);

  /**
   * Patch the delivery schedule in the local draft (merges the given fields).
   * @param {Partial<{dayOfWeek: number, hour: number, minute: number, timezone: string}>} patch
   */
  const setSchedule = useCallback((patch) => {
    setConfig((prev) =>
      prev ? { ...prev, schedule: { ...prev.schedule, ...patch } } : prev
    );
  }, []);

  /**
   * Add a recipient email to the local draft. No-ops on empty/duplicate.
   * @param {string} email
   * @returns {boolean} whether the email was added
   */
  const addRecipient = useCallback((email) => {
    const next = String(email || "").trim();
    if (!next) return false;
    let added = false;
    setConfig((prev) => {
      if (!prev) return prev;
      const exists = prev.recipients.some(
        (r) => r.toLowerCase() === next.toLowerCase()
      );
      if (exists) return prev;
      added = true;
      return { ...prev, recipients: [...prev.recipients, next] };
    });
    return added;
  }, []);

  /**
   * Remove a recipient email from the local draft.
   * @param {string} email
   */
  const removeRecipient = useCallback((email) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            recipients: prev.recipients.filter(
              (r) => r.toLowerCase() !== String(email || "").toLowerCase()
            ),
          }
        : prev
    );
  }, []);

  const { errors, warning, isValid } = useMemo(() => {
    if (!config) return { errors: {}, warning: null, isValid: false };
    const result = validateDigestConfig(config);
    return {
      errors: result.errors,
      warning: result.warning,
      isValid: result.valid,
    };
  }, [config]);

  /**
   * Validate then persist the draft. Blocks + toasts on invalid input; surfaces
   * success/failure via sonner. Resolves `true` on success, `false` otherwise.
   */
  const save = useCallback(async () => {
    if (!config) return false;
    const { valid, errors: validationErrors } = validateDigestConfig(config);
    if (!valid) {
      toast.error(
        Object.values(validationErrors)[0] || "Fix the highlighted fields first"
      );
      return false;
    }
    setIsSaving(true);
    try {
      const { config: saved } = await updateDigestConfig(config);
      setConfig(saved);
      toast.success("Digest schedule saved");
      return true;
    } catch (err) {
      toast.error(err?.message || "Couldn't save the digest schedule");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  return {
    config,
    setConfig,
    toggleDigest,
    setSchedule,
    addRecipient,
    removeRecipient,
    errors,
    warning,
    isValid,
    isLoading,
    isSaving,
    error,
    save,
    refresh,
  };
}
