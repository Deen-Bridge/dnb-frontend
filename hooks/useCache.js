import { useState, useEffect, useCallback } from "react";
import { smartCache, cachedFetch, CACHE_CONFIG } from "@/lib/utils/cache";

/**
 * Custom hook for caching data
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not in cache
 * @param {Object} options - Cache options
 */
export const useCache = (key, fetchFn, options = {}) => {
  const {
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    storage = "auto",
    enabled = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (!forceRefresh) {
          const cached = smartCache.get(key);
          if (cached) {
            setData(cached);
            setLoading(false);
            return cached;
          }
        }

        // Fetch fresh data
        const freshData = await fetchFn();

        // Cache the result
        smartCache.set(key, freshData, { ttl, storage });

        setData(freshData);
        setLoading(false);
        return freshData;
      } catch (err) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [key, fetchFn, ttl, storage, enabled]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    smartCache.remove(key);
    setData(null);
  }, [key]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  };
};

/**
 * Hook for cached API calls
 */
export const useCachedFetch = (url, options = {}) => {
  const {
    cacheKey = url,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    storage = "auto",
    enabled = true,
    fetchOptions = {},
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled || !url) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await cachedFetch(url, {
          cacheKey,
          ttl,
          storage,
          forceRefresh,
          fetchOptions,
        });

        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [url, cacheKey, ttl, storage, enabled, fetchOptions]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

export default useCache;
