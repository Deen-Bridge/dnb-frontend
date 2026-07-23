import {
  cachedFetch,
  cacheKeys,
  CACHE_CONFIG,
  smartCache,
} from "@/lib/utils/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Courses API with caching
 */
export const coursesAPI = {
  /**
   * Get all courses
   */
  getAll: async (forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/courses`, {
        cacheKey: cacheKeys.courses(),
        ttl: CACHE_CONFIG.COURSES,
        forceRefresh,
        storage: "local",
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  },

  /**
   * Get single course by ID
   */
  getById: async (courseId, forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/courses/${courseId}`, {
        cacheKey: cacheKeys.course(courseId),
        ttl: CACHE_CONFIG.COURSES,
        forceRefresh,
        storage: "local",
      });
      return data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  },

  /**
   * Clear course cache
   */
  clearCache: () => {
    smartCache.remove(cacheKeys.courses());
  },

  /**
   * Clear specific course cache
   */
  clearCourseCache: (courseId) => {
    smartCache.remove(cacheKeys.course(courseId));
  },
};

/**
 * Books API with caching
 */
export const booksAPI = {
  getAll: async (forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/books`, {
        cacheKey: cacheKeys.books(),
        ttl: CACHE_CONFIG.BOOKS,
        forceRefresh,
        storage: "local",
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching books:", error);
      return [];
    }
  },

  getById: async (bookId, forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/books/${bookId}`, {
        cacheKey: cacheKeys.book(bookId),
        ttl: CACHE_CONFIG.BOOKS,
        forceRefresh,
        storage: "local",
      });
      return data;
    } catch (error) {
      console.error(`Error fetching book ${bookId}:`, error);
      return null;
    }
  },

  clearCache: () => {
    smartCache.remove(cacheKeys.books());
  },

  clearBookCache: (bookId) => {
    smartCache.remove(cacheKeys.book(bookId));
  },
};

/**
 * Spaces API with caching
 */
export const spacesAPI = {
  getAll: async (forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/spaces`, {
        cacheKey: cacheKeys.spaces(),
        ttl: CACHE_CONFIG.SPACES,
        forceRefresh,
        storage: "session",
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching spaces:", error);
      return [];
    }
  },

  getById: async (spaceId, forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/spaces/${spaceId}`, {
        cacheKey: cacheKeys.space(spaceId),
        ttl: CACHE_CONFIG.SPACES,
        forceRefresh,
        storage: "session",
      });
      return data;
    } catch (error) {
      console.error(`Error fetching space ${spaceId}:`, error);
      return null;
    }
  },

  clearCache: () => {
    smartCache.remove(cacheKeys.spaces());
  },
};

/**
 * Reels API with caching
 */
export const reelsAPI = {
  getAll: async (forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/reels`, {
        cacheKey: cacheKeys.reels(),
        ttl: CACHE_CONFIG.REELS,
        forceRefresh,
        storage: "memory", // Reels change frequently, use memory cache
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching reels:", error);
      return [];
    }
  },

  getById: async (reelId, forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/reels/${reelId}`, {
        cacheKey: cacheKeys.reel(reelId),
        ttl: CACHE_CONFIG.REELS,
        forceRefresh,
        storage: "memory",
      });
      return data;
    } catch (error) {
      console.error(`Error fetching reel ${reelId}:`, error);
      return null;
    }
  },

  clearCache: () => {
    smartCache.remove(cacheKeys.reels());
  },
};

/**
 * User API with caching
 */
export const userAPI = {
  getById: async (userId, forceRefresh = false) => {
    try {
      const data = await cachedFetch(`${API_URL}/api/users/${userId}`, {
        cacheKey: cacheKeys.user(userId),
        ttl: CACHE_CONFIG.USER_DATA,
        forceRefresh,
        storage: "local",
      });
      return data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  },

  clearCache: (userId) => {
    smartCache.remove(cacheKeys.user(userId));
  },
};

/**
 * Search API with caching
 */
export const searchAPI = {
  search: async (query, forceRefresh = false) => {
    try {
      const data = await cachedFetch(
        `${API_URL}/api/search?q=${encodeURIComponent(query)}`,
        {
          cacheKey: cacheKeys.search(query),
          ttl: CACHE_CONFIG.SEARCH_RESULTS,
          forceRefresh,
          storage: "session",
        }
      );
      return data || { results: [] };
    } catch (error) {
      console.error("Error searching:", error);
      return { results: [] };
    }
  },

  clearCache: (query) => {
    if (query) {
      smartCache.remove(cacheKeys.search(query));
    }
  },
};

/**
 * Clear all API caches
 */
export const clearAllCaches = () => {
  coursesAPI.clearCache();
  booksAPI.clearCache();
  spacesAPI.clearCache();
  reelsAPI.clearCache();
  console.log("✅ All API caches cleared");
};

const cachedAPI = {
  courses: coursesAPI,
  books: booksAPI,
  spaces: spacesAPI,
  reels: reelsAPI,
  user: userAPI,
  search: searchAPI,
  clearAll: clearAllCaches,
};

export default cachedAPI;
