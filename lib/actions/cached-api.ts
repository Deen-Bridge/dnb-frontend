import {
  cachedFetch,
  cacheKeys,
  CACHE_CONFIG,
  smartCache,
} from "@/lib/utils/cache";
import { config } from "@/lib/config/env";

const API_URL = config.apiUrl;

export const coursesAPI = {
  getAll: async (forceRefresh: boolean = false): Promise<any[]> => { // TODO(types): Courses array
    try {
      const data = await cachedFetch<any[]>(`${API_URL}/api/courses`, { // TODO(types): Courses array
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

  getById: async (courseId: string, forceRefresh: boolean = false): Promise<any | null> => { // TODO(types): Single course record
    try {
      const data = await cachedFetch<any>(`${API_URL}/api/courses/${courseId}`, { // TODO(types): Single course record
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

  clearCache: (): void => {
    smartCache.remove(cacheKeys.courses());
  },

  clearCourseCache: (courseId: string): void => {
    smartCache.remove(cacheKeys.course(courseId));
  },
};

export const booksAPI = {
  getAll: async (forceRefresh: boolean = false): Promise<any[]> => { // TODO(types): Books array
    try {
      const data = await cachedFetch<any[]>(`${API_URL}/api/books`, { // TODO(types): Books array
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

  getById: async (bookId: string, forceRefresh: boolean = false): Promise<any | null> => { // TODO(types): Single book record
    try {
      const data = await cachedFetch<any>(`${API_URL}/api/books/${bookId}`, { // TODO(types): Single book record
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

  clearCache: (): void => {
    smartCache.remove(cacheKeys.books());
  },

  clearBookCache: (bookId: string): void => {
    smartCache.remove(cacheKeys.book(bookId));
  },
};

export const spacesAPI = {
  getAll: async (forceRefresh: boolean = false): Promise<any[]> => { // TODO(types): Spaces array
    try {
      const data = await cachedFetch<any[]>(`${API_URL}/api/spaces`, { // TODO(types): Spaces array
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

  getById: async (spaceId: string, forceRefresh: boolean = false): Promise<any | null> => { // TODO(types): Single space record
    try {
      const data = await cachedFetch<any>(`${API_URL}/api/spaces/${spaceId}`, { // TODO(types): Single space record
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

  clearCache: (): void => {
    smartCache.remove(cacheKeys.spaces());
  },
};

export const reelsAPI = {
  getAll: async (forceRefresh: boolean = false): Promise<any[]> => { // TODO(types): Reels array
    try {
      const data = await cachedFetch<any[]>(`${API_URL}/api/reels`, { // TODO(types): Reels array
        cacheKey: cacheKeys.reels(),
        ttl: CACHE_CONFIG.REELS,
        forceRefresh,
        storage: "memory",
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching reels:", error);
      return [];
    }
  },

  getById: async (reelId: string, forceRefresh: boolean = false): Promise<any | null> => { // TODO(types): Single reel record
    try {
      const data = await cachedFetch<any>(`${API_URL}/api/reels/${reelId}`, { // TODO(types): Single reel record
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

  clearCache: (): void => {
    smartCache.remove(cacheKeys.reels());
  },
};

export const userAPI = {
  getById: async (userId: string, forceRefresh: boolean = false): Promise<any | null> => { // TODO(types): User profile record
    try {
      const data = await cachedFetch<any>(`${API_URL}/api/users/${userId}`, { // TODO(types): User profile record
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

  clearCache: (userId: string): void => {
    smartCache.remove(cacheKeys.user(userId));
  },
};

export const searchAPI = {
  search: async (query: string, forceRefresh: boolean = false): Promise<any> => { // TODO(types): Search results payload
    try {
      const data = await cachedFetch<any>( // TODO(types): Search results generic response
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

  clearCache: (query?: string): void => {
    if (query) {
      smartCache.remove(cacheKeys.search(query));
    }
  },
};

export const clearAllCaches = (): void => {
  coursesAPI.clearCache();
  booksAPI.clearCache();
  spacesAPI.clearCache();
  reelsAPI.clearCache();
  console.log("✅ All API caches cleared");
};

const cachedApi = {
  courses: coursesAPI,
  books: booksAPI,
  spaces: spacesAPI,
  reels: reelsAPI,
  user: userAPI,
  search: searchAPI,
  clearAll: clearAllCaches,
};

export default cachedApi;
