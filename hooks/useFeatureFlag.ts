"use client";

import { useContext, useCallback } from "react";
import { FeatureFlagContext } from "@/contexts/FeatureFlagContext";

export interface UseFeatureFlagResult {
  enabled: boolean;
  loading: boolean;
  rolloutPercentage: number;
  isCritical: boolean;
  refresh: () => void;
}

export function useFeatureFlag(key: string): UseFeatureFlagResult {
  const context = useContext(FeatureFlagContext) as any; // TODO(types): Context type for feature flags

  if (!context) {
    throw new Error(
      "useFeatureFlag must be used within a FeatureFlagProvider"
    );
  }

  const { flags = [], loading = false, refresh = () => {} } = context;

  const flag = flags.find((f: any) => f.key === key); // TODO(types): Feature flag item

  const isEnabledForUser = useCallback((): boolean => {
    if (!flag || !flag.enabled) return false;
    if (flag.rolloutPercentage === 100) return true;
    if (flag.rolloutPercentage === 0) return false;

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
