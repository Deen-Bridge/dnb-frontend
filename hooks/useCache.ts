import { useState, useEffect, useCallback } from "react";
import { smartCache, cachedFetch, CACHE_CONFIG } from "@/lib/utils/cache";

export interface UseCacheOptions {
  ttl?: number;
  storage?: "memory" | "session" | "local" | "auto";
  enabled?: boolean;
}

export interface UseCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<T | null | undefined>;
  clearCache: () => void;
}

export const useCache = <T = any>( // TODO(types): Cached item generic payload
  key: string,
  fetchFn: () => Promise<T>,
  options: UseCacheOptions = {}
): UseCacheResult<T> => {
  const {
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    storage = "auto",
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false): Promise<T | null | undefined> => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!forceRefresh) {
          const cached = smartCache.get<T>(key);
          if (cached) {
            setData(cached);
            setLoading(false);
            return cached;
          }
        }

        const freshData = await fetchFn();
        smartCache.set(key, freshData, { ttl, storage });

        setData(freshData);
        setLoading(false);
        return freshData;
      } catch (err: any) { // TODO(types): Cache fetch error
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

export interface UseCachedFetchOptions {
  cacheKey?: string;
  ttl?: number;
  storage?: "memory" | "session" | "local" | "auto";
  enabled?: boolean;
  fetchOptions?: RequestInit;
}

export interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<T | null | undefined>;
}

export const useCachedFetch = <T = any>( // TODO(types): Cached fetch generic response
  url: string,
  options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> => {
  const {
    cacheKey = url,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    storage = "auto",
    enabled = true,
    fetchOptions = {},
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false): Promise<T | null | undefined> => {
      if (!enabled || !url) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await cachedFetch<T>(url, {
          cacheKey,
          ttl,
          storage,
          forceRefresh,
          fetchOptions,
        });

        setData(result);
        setLoading(false);
        return result;
      } catch (err: any) { // TODO(types): Error from cached fetch
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
