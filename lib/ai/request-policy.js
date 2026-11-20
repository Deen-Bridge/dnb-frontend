import { cookies } from "next/headers";

export const AI_LIMITS = Object.freeze({
  maxMessageLength: 8_000,
  maxContextLength: 12_000,
  maxChatIdLength: 128,
});

export async function getAuthenticatedAiRequest(body) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    return { error: "Authentication is required", status: 401 };
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const context = body?.context == null ? "Islamic knowledge and guidance" : body.context;
  const chatId = body?.chat_id == null ? null : body.chat_id;

  if (!message || message.length > AI_LIMITS.maxMessageLength) {
    return { error: "message is required and must be at most 8000 characters", status: 400 };
  }
  if (typeof context !== "string" || context.length > AI_LIMITS.maxContextLength) {
    return { error: "context must be at most 12000 characters", status: 400 };
  }
  if (chatId !== null && (typeof chatId !== "string" || chatId.length > AI_LIMITS.maxChatIdLength)) {
    return { error: "chat_id must be at most 128 characters", status: 400 };
  }

  return {
    token,
    payload: {
      prompt: message,
      chat_id: chatId,
      context,
    },
  };
}

export function policyError(result) {
  return new Response(JSON.stringify({ error: true, message: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
