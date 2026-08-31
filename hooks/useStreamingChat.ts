import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
  [key: string]: any; // TODO(types): Message metadata
}

export interface SendMessageResult {
  chatId: string | null;
  history: any[]; // TODO(types): Chat history payload
  response: string;
}

export interface UseStreamingChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  chatId: string | null;
  error: string | null;
  sendMessage: (message: string, context?: any) => Promise<SendMessageResult | undefined>; // TODO(types): Additional context
  stopStreaming: () => void;
  newConversation: () => void;
  setMessagesFromHistory: (historyMessages: ChatMessage[]) => void;
}

export function useStreamingChat(
  userId: string | null = null,
  initialChatId: string | null = null
): UseStreamingChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string, context: any = null): Promise<SendMessageResult | undefined> => { // TODO(types): Context parameter
      if (!message?.trim()) {
        toast.error("Please enter a message");
        return;
      }

      const userMessage: ChatMessage = { role: "user", content: message.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
            chat_id: chatId,
            user_id: userId,
            context: context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to start streaming");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }
        const decoder = new TextDecoder();

        let aiMessageContent = "";
        let currentChatId = chatId;
        let history: any[] = []; // TODO(types): History array

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", isStreaming: true },
        ]);

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
                      currentChatId = data.chat_id;
                      setChatId(data.chat_id);
                    }
                    break;

                  case "content":
                    aiMessageContent += data.text;

                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
                          content: aiMessageContent,
                          isStreaming: true,
                        };
                      }
                      return newMessages;
                    });
                    break;

                  case "done":
                    if (data.chat_id) {
                      setChatId(data.chat_id);
                    }
                    if (data.history) {
                      history = data.history;
                    }

                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
                          content: aiMessageContent,
                          isStreaming: false,
                        };
                      }
                      return newMessages;
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
          chatId: currentChatId,
          history: history,
          response: aiMessageContent,
        };
      } catch (err: any) { // TODO(types): Error from streaming chat
        if (err?.name === "AbortError") {
          console.log("Stream aborted");
          return;
        }

        console.error("Streaming error:", err);
        setError(err?.message || "Failed to get AI response");

        const errorMessage = err?.message || "Failed to get AI response";
        toast.error(errorMessage);

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;

          if (newMessages[lastIndex]?.role === "assistant") {
            newMessages[lastIndex] = {
              role: "assistant",
              content:
                "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
              isError: true,
              isStreaming: false,
            };
          } else {
            newMessages.push({
              role: "assistant",
              content:
                "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
              isError: true,
            });
          }

          return newMessages;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [chatId, userId]
  );

  const stopStreaming = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const newConversation = useCallback((): void => {
    setMessages([]);
    setChatId(null);
    setError(null);
  }, []);

  const setMessagesFromHistory = useCallback((historyMessages: ChatMessage[]): void => {
    setMessages(historyMessages);
  }, []);

  return {
    messages,
    isStreaming,
    chatId,
    error,
    sendMessage,
    stopStreaming,
    newConversation,
    setMessagesFromHistory,
  };
}
