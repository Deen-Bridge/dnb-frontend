import { logger } from "@/lib/logger";
import { cachedFetch, cacheKeys, CACHE_CONFIG, getCacheScope } from "@/lib/utils/cache";
import { config } from "@/lib/config/env";

function authenticatedRequest(): RequestInit {
  if (typeof document === "undefined") {
    throw new Error("AI history must be loaded from an authenticated browser session");
  }
  const token = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("authToken="))
    ?.slice("authToken=".length);
  if (!token || !getCacheScope()) throw new Error("Authenticated AI session is required");
  return { headers: { Authorization: `Bearer ${decodeURIComponent(token)}` } };
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatHistoryResult {
  chats: any[]; // TODO(types): Chat history summaries
  [key: string]: any; // TODO(types): Additional chat history properties
}

export const loadChatHistory = async (userId: string, forceRefresh: boolean = false): Promise<ChatHistoryResult> => {
  try {
    const AI_API_URL = config.aiApiUrl;
    const fetchOptions = authenticatedRequest();

    const data = await cachedFetch(`${AI_API_URL}/user/${userId}/chats`, {
      cacheKey: cacheKeys.chatHistory(userId),
      ttl: CACHE_CONFIG.CHAT_HISTORY,
      forceRefresh,
      storage: "session",
      fetchOptions,
    });

    return data || { chats: [] };
  } catch (error) {
    logger.error("Error loading chat history:", error);
    return { chats: [] };
  }
};

export const loadChatMessages = async (chatId: string, forceRefresh: boolean = false): Promise<ChatMessage[]> => {
  try {
    const AI_API_URL = config.aiApiUrl;
    const fetchOptions = authenticatedRequest();

    const history = await cachedFetch(`${AI_API_URL}/chat/${chatId}/history`, {
      cacheKey: cacheKeys.chatMessages(chatId),
      ttl: CACHE_CONFIG.CHAT_HISTORY,
      forceRefresh,
      storage: "session",
      fetchOptions,
    });

    return (history || []).map((msg: any) => ({ // TODO(types): AI message shape from history endpoint
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.text || msg.content || "",
    }));
  } catch (error) {
    logger.error("Error loading chat messages:", error);
    return [];
  }
};
