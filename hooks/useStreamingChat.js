/**
 * useStreamingChat Hook
 *
 * A custom React hook for streaming AI chat responses with conversation history support.
 *
 * Features:
 * - Real-time streaming responses
 * - Automatic conversation history management
 * - Error handling
 * - Loading states
 *
 * @example
 * const { sendMessage, messages, isStreaming, chatId } = useStreamingChat(userId);
 *
 * await sendMessage("What are the five pillars of Islam?");
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function useStreamingChat(userId = null, initialChatId = null) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState(initialChatId);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(
    async (message, context = null) => {
      if (!message?.trim()) {
        toast.error("Please enter a message");
        return;
      }

      // Add user message immediately
      const userMessage = { role: "user", content: message.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);

      // Create abort controller for this request
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

        // Check if response is JSON (error) or stream
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to start streaming");
        }

        // Process the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let aiMessageContent = "";
        let currentChatId = chatId;
        let history = [];

        // Add a placeholder for AI message
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
                    // Store chat ID from metadata
                    if (data.chat_id) {
                      currentChatId = data.chat_id;
                      setChatId(data.chat_id);
                    }
                    break;

                  case "content":
                    // Append streaming content
                    aiMessageContent += data.text;

                    // Update the AI message with streaming content
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
                    // Finalize the message
                    if (data.chat_id) {
                      setChatId(data.chat_id);
                    }
                    if (data.history) {
                      history = data.history;
                    }

                    // Mark streaming as complete
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
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
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Stream aborted");
          return;
        }

        console.error("Streaming error:", err);
        setError(err.message);

        // Show error message to user
        const errorMessage = err.message || "Failed to get AI response";
        toast.error(errorMessage);

        // Add error message to chat
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;

          // Update or add error message
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

  /**
   * Stop the current streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  /**
   * Clear all messages and start a new conversation
   */
  const newConversation = useCallback(() => {
    setMessages([]);
    setChatId(null);
    setError(null);
  }, []);

  /**
   * Set messages from external source (e.g., loaded history)
   */
  const setMessagesFromHistory = useCallback((historyMessages) => {
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
