"use client";

import { useContext, useCallback } from "react";
import { FeatureFlagContext } from "@/contexts/FeatureFlagContext";

/**
 * Custom hook to check if a feature flag is enabled.
 *
 * @param {string} key - The feature flag key (kebab-case)
 * @returns {{ enabled: boolean, loading: boolean, rolloutPercentage: number, refresh: () => void }}
 *
 * @example
 * ```jsx
 * import { useFeatureFlag } from "@/hooks/useFeatureFlag";
 *
 * function MyComponent() {
 *   const { enabled, loading } = useFeatureFlag("ai-assistant");
 *
 *   if (loading) return <Skeleton />;
 *   if (!enabled) return null;
 *
 *   return <AIAssistant />;
 * }
 * ```
 */
export function useFeatureFlag(key) {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      "useFeatureFlag must be used within a FeatureFlagProvider"
    );
  }

  const { flags, loading, refresh } = context;

  const flag = flags.find((f) => f.key === key);

  // Determine if the feature is enabled for this user
  // Uses session-based user ID to determine rollout bucket
  const isEnabledForUser = useCallback(() => {
    if (!flag || !flag.enabled) return false;
    if (flag.rolloutPercentage === 100) return true;
    if (flag.rolloutPercentage === 0) return false;

    // Use a hash of the user session to determine bucket
    // This ensures consistent behavior for the same user
    const sessionId = typeof window !== "undefined"
      ? sessionStorage.getItem("userId") || "anonymous"
      : "anonymous";

    const hash = sessionId.split("").reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);

    const bucket = Math.abs(hash) % 100;
    return bucket < flag.rolloutPercentage;
  }, [flag]);

  return {
    enabled: isEnabledForUser(),
    loading,
    rolloutPercentage: flag?.rolloutPercentage ?? 0,
    isCritical: flag?.isCritical ?? false,
    refresh,
  };
}

/**
 * Hook to get all feature flags.
 * Useful for admin interfaces or debugging.
 *
 * @returns {{ flags: Array, loading: boolean, refresh: () => void }}
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagProvider"
    );
  }

  return context;
}

export default useFeatureFlag;
