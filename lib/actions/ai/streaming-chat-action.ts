export interface StreamChatParams {
  message: string;
  chatId?: string | null;
  userId?: string | null;
  context?: string | null;
  onChunk?: (chunk: string, fullResponse: string) => void;
  onComplete?: (result: { chatId: string | null; history: any[]; response: string }) => void; // TODO(types): AI history item shape
  onError?: (error: unknown) => void;
}

export interface StreamChatResult {
  chatId: string | null;
  history: any[]; // TODO(types): AI history item shape
  response: string;
}

export async function streamChat({
  message,
  chatId = null,
  userId = null,
  context = null,
  onChunk = () => {},
  onComplete = () => {},
  onError = () => {},
}: StreamChatParams): Promise<StreamChatResult> {
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

    if (!response.body) {
      throw new Error("ReadableStream not supported or response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = "";
    let finalChatId = chatId;
    let history: any[] = []; // TODO(types): AI history messages

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
