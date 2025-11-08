/**
 * Cache Utility Functions for DeenBridge
 * Provides localStorage, sessionStorage, and in-memory caching
 */

// In-memory cache for runtime data
const memoryCache = new Map();

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Default TTL (Time To Live) in milliseconds
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes

  // Specific cache durations
  USER_DATA: 15 * 60 * 1000, // 15 minutes
  COURSES: 10 * 60 * 1000, // 10 minutes
  BOOKS: 10 * 60 * 1000, // 10 minutes
  SPACES: 5 * 60 * 1000, // 5 minutes
  REELS: 3 * 60 * 1000, // 3 minutes
  CHAT_HISTORY: 2 * 60 * 1000, // 2 minutes
  SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
};

/**
 * Check if cache is expired
 */
const isExpired = (timestamp, ttl) => {
  return Date.now() - timestamp > ttl;
};

/**
 * LocalStorage Cache (Persistent across sessions)
 */
export const localCache = {
  /**
   * Set item in localStorage with expiry
   */
  set: (key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    try {
      const item = {
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

  /**
   * Get item from localStorage
   */
  get: (key) => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);

      // Check if expired
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

  /**
   * Remove item from localStorage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing localStorage cache:", error);
      return false;
    }
  },

  /**
   * Clear all cache items (items with timestamp)
   */
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Skip non-JSON items
        }
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage cache:", error);
      return false;
    }
  },

  /**
   * Clear expired items
   */
  clearExpired: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        try {
          const itemStr = localStorage.getItem(key);
          const item = JSON.parse(itemStr);
          if (item && item.timestamp && isExpired(item.timestamp, item.ttl)) {
            localStorage.removeItem(key);
          }
        } catch (e) {
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

/**
 * SessionStorage Cache (Clears when browser closes)
 */
export const sessionCache = {
  set: (key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    try {
      const item = {
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

  get: (key) => {
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);

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

  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing sessionStorage cache:", error);
      return false;
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage cache:", error);
      return false;
    }
  },
};

/**
 * Memory Cache (In-memory, fastest but clears on page refresh)
 */
export const memCache = {
  set: (key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    return true;
  },

  get: (key) => {
    const item = memoryCache.get(key);
    if (!item) return null;

    if (isExpired(item.timestamp, item.ttl)) {
      memoryCache.delete(key);
      return null;
    }

    return item.value;
  },

  remove: (key) => {
    return memoryCache.delete(key);
  },

  clear: () => {
    memoryCache.clear();
    return true;
  },

  clearExpired: () => {
    memoryCache.forEach((item, key) => {
      if (isExpired(item.timestamp, item.ttl)) {
        memoryCache.delete(key);
      }
    });
    return true;
  },
};

/**
 * Smart Cache (Automatically chooses best storage method)
 */
export const smartCache = {
  /**
   * Set with automatic storage selection
   * Small data -> memory, Medium -> session, Large/Important -> local
   */
  set: (key, value, options = {}) => {
    const { ttl = CACHE_CONFIG.DEFAULT_TTL, storage = "auto" } = options;

    try {
      const valueSize = JSON.stringify(value).length;

      // Auto-select storage based on size and importance
      if (storage === "auto") {
        if (valueSize < 1000) {
          // Small data -> memory cache
          return memCache.set(key, value, ttl);
        } else if (valueSize < 50000) {
          // Medium data -> session storage
          return sessionCache.set(key, value, ttl);
        } else {
          // Large data -> local storage
          return localCache.set(key, value, ttl);
        }
      }

      // Use specified storage
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

  /**
   * Get from any storage (checks all)
   */
  get: (key) => {
    // Check memory first (fastest)
    let value = memCache.get(key);
    if (value !== null) return value;

    // Check session storage
    value = sessionCache.get(key);
    if (value !== null) return value;

    // Check local storage
    value = localCache.get(key);
    return value;
  },

  /**
   * Remove from all storages
   */
  remove: (key) => {
    memCache.remove(key);
    sessionCache.remove(key);
    localCache.remove(key);
    return true;
  },

  /**
   * Clear all caches
   */
  clear: () => {
    memCache.clear();
    sessionCache.clear();
    localCache.clear();
    return true;
  },
};

/**
 * Cached API call wrapper
 */
export const cachedFetch = async (url, options = {}) => {
  const {
    cacheKey = url,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    forceRefresh = false,
    storage = "auto",
  } = options;

  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = smartCache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return cached;
    }
  }

  // Fetch fresh data
  console.log(`🔄 Cache miss, fetching: ${cacheKey}`);
  try {
    const response = await fetch(url, options.fetchOptions || {});

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    smartCache.set(cacheKey, data, { ttl, storage });

    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Cache key generators for common entities
 */
export const cacheKeys = {
  user: (userId) => `user:${userId}`,
  courses: () => "courses:all",
  course: (courseId) => `course:${courseId}`,
  books: () => "books:all",
  book: (bookId) => `book:${bookId}`,
  spaces: () => "spaces:all",
  space: (spaceId) => `space:${spaceId}`,
  reels: () => "reels:all",
  reel: (reelId) => `reel:${reelId}`,
  chatHistory: (userId) => `chat:history:${userId}`,
  chatMessages: (chatId) => `chat:messages:${chatId}`,
  search: (query) => `search:${query}`,
};

/**
 * Initialize cache cleanup on app start
 */
export const initCache = () => {
  // Clear expired items on init
  localCache.clearExpired();
  memCache.clearExpired();

  // Set up periodic cleanup (every 5 minutes)
  setInterval(() => {
    localCache.clearExpired();
    memCache.clearExpired();
  }, 5 * 60 * 1000);

  console.log("✅ Cache system initialized");
};

export { CACHE_CONFIG };
export default smartCache;
