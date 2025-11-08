import { cachedFetch, cacheKeys, CACHE_CONFIG } from "@/lib/utils/cache";

/**
 * Load chat history for a specific user
 * @param {string} userId - The user ID
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Object>} - Chat history data
 */
export const loadChatHistory = async (userId, forceRefresh = false) => {
  try {
    const AI_API_URL =
      process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

    const data = await cachedFetch(`${AI_API_URL}/user/${userId}/chats`, {
      cacheKey: cacheKeys.chatHistory(userId),
      ttl: CACHE_CONFIG.CHAT_HISTORY,
      forceRefresh,
      storage: "session", // Use session storage for chat history
    });

    return data || { chats: [] };
  } catch (error) {
    console.error("Error loading chat history:", error);
    return { chats: [] };
  }
};

/**
 * Load specific chat messages
 * @param {string} chatId - The chat ID
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Array>} - Array of messages
 */
export const loadChatMessages = async (chatId, forceRefresh = false) => {
  try {
    const AI_API_URL =
      process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

    const history = await cachedFetch(`${AI_API_URL}/chat/${chatId}/history`, {
      cacheKey: cacheKeys.chatMessages(chatId),
      ttl: CACHE_CONFIG.CHAT_HISTORY,
      forceRefresh,
      storage: "session",
    });

    return history || [];
  } catch (error) {
    console.error("Error loading chat messages:", error);
    return [];
  }
};
