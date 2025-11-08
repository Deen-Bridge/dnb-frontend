/**
 * Streaming Chat Action
 *
 * Client-side action for streaming AI chat with conversation history.
 * This can be used in both Client and Server Components.
 */

/**
 * Send a streaming chat message
 * @param {Object} params
 * @param {string} params.message - The user's message
 * @param {string} params.chatId - Optional chat ID to continue conversation
 * @param {string} params.userId - Optional user ID
 * @param {string} params.context - Optional context
 * @param {Function} params.onChunk - Callback for each chunk of streamed content
 * @param {Function} params.onComplete - Callback when streaming is complete
 * @param {Function} params.onError - Callback for errors
 */
export async function streamChat({
  message,
  chatId = null,
  userId = null,
  context = null,
  onChunk = () => {},
  onComplete = () => {},
  onError = () => {},
}) {
  try {
    const response = await fetch("/api/ai/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        chat_id: chatId,
        user_id: userId,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = "";
    let finalChatId = chatId;
    let history = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case "metadata":
                if (data.chat_id) {
                  finalChatId = data.chat_id;
                }
                break;

              case "content":
                fullResponse += data.text;
                onChunk(data.text, fullResponse);
                break;

              case "done":
                finalChatId = data.chat_id || finalChatId;
                history = data.history || [];
                onComplete({
                  chatId: finalChatId,
                  history,
                  response: fullResponse,
                });
                break;

              case "error":
                throw new Error(data.message || "Streaming error");
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
          }
        }
      }
    }

    return {
      chatId: finalChatId,
      history,
      response: fullResponse,
    };
  } catch (error) {
    console.error("Streaming error:", error);
    onError(error);
    throw error;
  }
}
