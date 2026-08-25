"use client";

import { createContext, useState, useEffect, useCallback, useMemo } from "react";

/**
 * Feature Flag Context
 *
 * Provides session-scoped feature flag data to the application.
 * Flags are cached in sessionStorage to minimize API calls.
 *
 * @example
 * ```jsx
 * // In your app layout or providers
 * import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <FeatureFlagProvider>
 *       {children}
 *     </FeatureFlagProvider>
 *   );
 * }
 * ```
 */

const CACHE_KEY = "feature_flags";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const FeatureFlagContext = createContext(null);

// Default flags (fallback if API fails)
const defaultFlags = [
  { key: "ai-assistant", enabled: false, rolloutPercentage: 0, isCritical: false },
  { key: "live-sessions", enabled: false, rolloutPercentage: 0, isCritical: false },
  { key: "stellar-payments", enabled: true, rolloutPercentage: 100, isCritical: true },
  { key: "gamification", enabled: false, rolloutPercentage: 0, isCritical: false },
  { key: "social-features", enabled: false, rolloutPercentage: 0, isCritical: false },
  { key: "maintenance-mode", enabled: false, rolloutPercentage: 0, isCritical: true },
];

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  // Load cached flags from sessionStorage
  const loadCachedFlags = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { flags: cachedFlags, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;

      if (isExpired) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cachedFlags;
    } catch (error) {
      console.error("Failed to load cached flags:", error);
      return null;
    }
  }, []);

  // Save flags to sessionStorage
  const cacheFlags = useCallback((flagsToCache) => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          flags: flagsToCache,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to cache flags:", error);
    }
  }, []);

  // Fetch flags from API
  const fetchFlags = useCallback(async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch("/api/feature-flags");
      // const data = await response.json();
      // return data.flags;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Return mock data
      return [
        { key: "ai-assistant", enabled: true, rolloutPercentage: 100, isCritical: false },
        { key: "live-sessions", enabled: true, rolloutPercentage: 75, isCritical: false },
        { key: "stellar-payments", enabled: true, rolloutPercentage: 100, isCritical: true },
        { key: "gamification", enabled: false, rolloutPercentage: 0, isCritical: false },
        { key: "social-features", enabled: true, rolloutPercentage: 50, isCritical: false },
        { key: "maintenance-mode", enabled: false, rolloutPercentage: 0, isCritical: true },
      ];
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
      return null;
    }
  }, []);

  // Initialize flags on mount
  useEffect(() => {
    const initializeFlags = async () => {
      setLoading(true);

      // Try to load from cache first
      const cachedFlags = loadCachedFlags();
      if (cachedFlags) {
        setFlags(cachedFlags);
        setLoading(false);
        setLastFetch(Date.now());
        return;
      }

      // Fetch from API
      const fetchedFlags = await fetchFlags();
      if (fetchedFlags) {
        setFlags(fetchedFlags);
        cacheFlags(fetchedFlags);
        setLastFetch(Date.now());
      }

      setLoading(false);
    };

    initializeFlags();
  }, [loadCachedFlags, fetchFlags, cacheFlags]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);

    // Clear cache
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CACHE_KEY);
    }

    // Fetch fresh data
    const fetchedFlags = await fetchFlags();
    if (fetchedFlags) {
      setFlags(fetchedFlags);
      cacheFlags(fetchedFlags);
      setLastFetch(Date.now());
    }

    setLoading(false);
  }, [fetchFlags, cacheFlags]);

  // Context value
  const value = useMemo(
    () => ({
      flags,
      loading,
      lastFetch,
      refresh,
    }),
    [flags, loading, lastFetch, refresh]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export default FeatureFlagContext;
