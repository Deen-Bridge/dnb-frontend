/**
 * Streaming AI Chat Component
 *
 * A modern AI chat interface with real-time streaming responses
 * and conversation history support.
 */

"use client";
import {
  Bot,
  CornerDownLeft,
  Mic,
  Paperclip,
  ImageIcon,
  StopCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import {
  loadChatHistory,
  loadChatMessages,
} from "@/lib/actions/ai/load-chat-history";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function StreamingAIChat({ chatData, onChatUpdate }) {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Use the streaming chat hook
  const {
    messages,
    isStreaming,
    chatId,
    sendMessage,
    stopStreaming,
    newConversation,
    setMessagesFromHistory,
  } = useStreamingChat(userId, chatData?.chatId);

  // Sync with chatData from layout when sidebar selection changes
  useEffect(() => {
    if (chatData?.messages) {
      setMessagesFromHistory(chatData.messages);
    }
  }, [chatData, setMessagesFromHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user ID and chat history on mount
  useEffect(() => {
    const loadUserAndHistory = async () => {
      try {
        // Get user from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserId(userObj.id);

          // Load user's most recent chat if no chatData provided
          if (!chatData) {
            const data = await loadChatHistory(userObj.id);

            if (data.chats && data.chats.length > 0) {
              // Load the most recent chat
              const latestChat = data.chats[0];

              // Load the chat history messages
              const history = await loadChatMessages(latestChat.chat_id);
              setMessagesFromHistory(history);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserAndHistory();
  }, [chatData, setMessagesFromHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Send message with streaming
    const result = await sendMessage(userMessage);

    // Notify layout about chat update if callback provided
    if (result?.chatId && onChatUpdate) {
      onChatUpdate(result.chatId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewConversation = () => {
    newConversation();
    if (onChatUpdate) {
      onChatUpdate(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid flex-1 gap-4 overflow-y-auto">
        <div className="relative flex flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
          <div className="absolute right-3 top-3 flex gap-2">
            <Badge variant="outline" className="border-accent">
              {isStreaming ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Streaming...
                </span>
              ) : (
                "Ready"
              )}
            </Badge>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-xs"
              >
                New Chat
              </Button>
            )}
          </div>

          <div className="relative flex-1 overflow-y-auto mb-4 overscroll-auto">
            {/* Welcome Screen - Show when no messages */}
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                {/* AI Image with stunning effects */}
                <div className="relative mb-8 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-highlight/20 rounded-full blur-2xl"></div>
                    <div className="relative bg-gradient-to-br from-background to-muted p-2 rounded-full border-4 border-accent/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src="/images/ai.png"
                        alt="DeenBridge AI Assistant"
                        width={140}
                        height={140}
                        className="rounded-full"
                        priority
                      />
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full animate-ping"></div>
                    <div
                      className="absolute bottom-0 left-0 w-2 h-2 bg-highlight rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                  </div>
                </div>

                {/* Welcome Text with gradient */}
                <div className="mb-10 space-y-4 max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-accent via-highlight to-accent bg-clip-text text-transparent">
                      Assalamu Alaikum!
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    I'm your Islamic AI assistant powered by knowledge of the{" "}
                    <span className="font-semibold text-accent">Quran</span> and{" "}
                    <span className="font-semibold text-highlight">Hadith</span>
                    . Experience real-time streaming responses!
                  </p>

                  {/* AI Features badges */}
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    <span className="px-3 py-1 bg-accent/10 text-highlight text-xs font-medium rounded-full border border-highlight/20">
                      ⚡ Real-time Streaming
                    </span>
                    <span className="px-3 py-1 bg-accent/10 text-highlight text-xs font-medium rounded-full border border-highlight/20">
                      📖 Islamic Knowledge
                    </span>
                    <span className="px-3 py-1 bg-accent/10 text-highlight text-xs font-medium rounded-full border border-highlight/20">
                      💬 Conversation History
                    </span>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="w-full max-w-4xl">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                    Popular Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        emoji: "🕌",
                        question: "What are the 5 pillars of Islam?",
                      },
                      {
                        emoji: "🤲",
                        question: "Explain the importance of Salah",
                      },
                      {
                        emoji: "✨",
                        question: "Tell me about Prophet Muhammad ﷺ",
                      },
                      {
                        emoji: "🌙",
                        question: "What is the meaning of Ramadan?",
                      },
                      {
                        emoji: "💧",
                        question: "How do I perform Wudu?",
                      },
                      {
                        emoji: "📖",
                        question: "What are the benefits of reading Quran?",
                      },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setInputMessage(item.question)}
                        className="group relative p-5 text-left border-2 border-muted/50 rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1 bg-background overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative flex items-start gap-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                            {item.emoji}
                          </span>
                          <span className="text-sm font-medium leading-relaxed flex-1">
                            {item.question}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-4 h-4 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex gap-3 items-start ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.role === "user" ? (
                    <Avatar className="h-10 w-10 rounded-lg mt-2">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-accent text-white text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full mt-2 overflow-hidden">
                      <Image
                        src="/images/ai.png"
                        alt="AI Assistant"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`p-4 rounded-lg max-w-[80%] ${
                    message.role === "user" ? "bg-accent/10" : "bg-background"
                  } ${message.isStreaming ? "animate-pulse" : ""}`}
                >
                  {message.role === "assistant" ? (
                    <div className="relative">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="text-sm mb-2">{children}</p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-bold mb-2">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-2">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse"></span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isStreaming &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/10 p-4 rounded-lg w-fit">
                  <Bot className="size-4 animate-bounce" />
                  AI is thinking...
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="bottom-0 overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-accent"
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here... (Press Enter to send)"
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <div className="flex justify-between items-center p-3 pt-0">
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                      <Paperclip className="size-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Attach File (Coming Soon)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                      <ImageIcon className="size-4" />
                      <span className="sr-only">Attach Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Attach Image (Coming Soon)
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                      <Mic className="size-4" />
                      <span className="sr-only">Use Microphone</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Use Microphone (Coming Soon)
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                {isStreaming && (
                  <Button
                    type="button"
                    onClick={stopStreaming}
                    round
                    className="text-sm gap-1.5 text-white flex bg-red-500 hover:bg-red-600"
                  >
                    <StopCircle className="size-3.5" />
                  </Button>
                )}
                <Button
                  round
                  type="submit"
                  className="text-sm gap-1.5 text-white flex bg-accent hover:bg-highlight"
                  disabled={isStreaming || !inputMessage.trim()}
                >
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
