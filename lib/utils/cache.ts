interface CacheItem<T = any> { // TODO(types): Generic payload stored in cache
  value: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheItem>();

export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,
  USER_DATA: 15 * 60 * 1000,
  COURSES: 10 * 60 * 1000,
  BOOKS: 10 * 60 * 1000,
  SPACES: 5 * 60 * 1000,
  REELS: 3 * 60 * 1000,
  CHAT_HISTORY: 2 * 60 * 1000,
  SEARCH_RESULTS: 5 * 60 * 1000,
} as const;

const isExpired = (timestamp: number, ttl: number): boolean => {
  return Date.now() - timestamp > ttl;
};

export const localCache = {
  set: <T = any>(key: string, value: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): boolean => { // TODO(types): Cache payload value
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("Error setting localStorage cache:", error);
      return false;
    }
  },

  get: <T = any>(key: string): T | null => { // TODO(types): Cache payload return
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);

      if (isExpired(item.timestamp, item.ttl)) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error("Error getting localStorage cache:", error);
      return null;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing localStorage cache:", error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        try {
          const item = JSON.parse(localStorage.getItem(key) || "");
          if (item && item.timestamp) {
            localStorage.removeItem(key);
          }
        } catch {
          // Skip non-JSON items
        }
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage cache:", error);
      return false;
    }
  },

  clearExpired: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        try {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) return;
          const item: CacheItem = JSON.parse(itemStr);
          if (item && item.timestamp && isExpired(item.timestamp, item.ttl)) {
            localStorage.removeItem(key);
          }
        } catch {
          // Skip non-JSON items
        }
      });
      return true;
    } catch (error) {
      console.error("Error clearing expired cache:", error);
      return false;
    }
  },
};

export const sessionCache = {
  set: <T = any>(key: string, value: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): boolean => { // TODO(types): Session cache payload
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      sessionStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("Error setting sessionStorage cache:", error);
      return false;
    }
  },

  get: <T = any>(key: string): T | null => { // TODO(types): Session cache return
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);

      if (isExpired(item.timestamp, item.ttl)) {
        sessionStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error("Error getting sessionStorage cache:", error);
      return null;
    }
  },

  remove: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing sessionStorage cache:", error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage cache:", error);
      return false;
    }
  },
};

export const memCache = {
  set: <T = any>(key: string, value: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): boolean => { // TODO(types): Memory cache payload
    memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    return true;
  },

  get: <T = any>(key: string): T | null => { // TODO(types): Memory cache return
    const item = memoryCache.get(key);
    if (!item) return null;

    if (isExpired(item.timestamp, item.ttl)) {
      memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  },

  remove: (key: string): boolean => {
    return memoryCache.delete(key);
  },

  clear: (): boolean => {
    memoryCache.clear();
    return true;
  },

  clearExpired: (): boolean => {
    memoryCache.forEach((item, key) => {
      if (isExpired(item.timestamp, item.ttl)) {
        memoryCache.delete(key);
      }
    });
    return true;
  },
};

export interface SmartCacheOptions {
  ttl?: number;
  storage?: "auto" | "memory" | "session" | "local";
}

export const smartCache = {
  set: <T = any>(key: string, value: T, options: SmartCacheOptions = {}): boolean => { // TODO(types): SmartCache payload
    const { ttl = CACHE_CONFIG.DEFAULT_TTL, storage = "auto" } = options;

    try {
      const valueSize = JSON.stringify(value).length;

      if (storage === "auto") {
        if (valueSize < 1000) {
          return memCache.set(key, value, ttl);
        } else if (valueSize < 50000) {
          return sessionCache.set(key, value, ttl);
        } else {
          return localCache.set(key, value, ttl);
        }
      }

      switch (storage) {
        case "memory":
          return memCache.set(key, value, ttl);
        case "session":
          return sessionCache.set(key, value, ttl);
        case "local":
          return localCache.set(key, value, ttl);
        default:
          return memCache.set(key, value, ttl);
      }
    } catch (error) {
      console.error("Error in smartCache.set:", error);
      return false;
    }
  },

  get: <T = any>(key: string): T | null => { // TODO(types): SmartCache return value
    let value = memCache.get<T>(key);
    if (value !== null) return value;

    value = sessionCache.get<T>(key);
    if (value !== null) return value;

    value = localCache.get<T>(key);
    return value;
  },

  remove: (key: string): boolean => {
    memCache.remove(key);
    sessionCache.remove(key);
    localCache.remove(key);
    return true;
  },

  clear: (): boolean => {
    memCache.clear();
    sessionCache.clear();
    localCache.clear();
    return true;
  },
};

export interface CachedFetchOptions extends SmartCacheOptions {
  cacheKey?: string;
  forceRefresh?: boolean;
  fetchOptions?: RequestInit;
}

export const cachedFetch = async <T = any>(url: string, options: CachedFetchOptions = {}): Promise<T> => { // TODO(types): Generic response from cachedFetch
  const {
    cacheKey = url,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    forceRefresh = false,
    storage = "auto",
  } = options;

  if (!forceRefresh) {
    const cached = smartCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetch(url, options.fetchOptions || {});

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: T = await response.json();
    smartCache.set(cacheKey, data, { ttl, storage });

    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  courses: () => "courses:all",
  course: (courseId: string) => `course:${courseId}`,
  books: () => "books:all",
  book: (bookId: string) => `book:${bookId}`,
  spaces: () => "spaces:all",
  space: (spaceId: string) => `space:${spaceId}`,
  reels: () => "reels:all",
  reel: (reelId: string) => `reel:${reelId}`,
  chatHistory: (userId: string) => `chat:history:${userId}`,
  chatMessages: (chatId: string) => `chat:messages:${chatId}`,
  search: (query: string) => `search:${query}`,
};

export const initCache = (): void => {
  localCache.clearExpired();
  memCache.clearExpired();

  setInterval(() => {
    localCache.clearExpired();
    memCache.clearExpired();
  }, 5 * 60 * 1000);
};

export default smartCache;
