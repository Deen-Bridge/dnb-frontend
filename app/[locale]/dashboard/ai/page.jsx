"use client";
import { Bot, CornerDownLeft, Mic, Paperclip, ImageIcon, Menu } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  loadChatHistory,
  loadChatMessages,
} from "@/lib/actions/ai/load-chat-history";
import { streamChat } from "@/lib/actions/ai/streaming-chat-action";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { useAiLayout } from "./context";

const markdownComponents = {
  p: ({ children }) => (
    <p className={cn(poppins_400, "mb-2 text-sm leading-relaxed text-ink")}>
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 className={cn(poppins_600, "mb-2 text-xl text-ink")}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className={cn(poppins_600, "mb-2 text-lg text-ink")}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className={cn(poppins_600, "mb-2 text-base text-ink")}>{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className={cn(poppins_400, "mb-2 list-disc pl-4 text-ink")}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={cn(poppins_400, "mb-2 list-decimal pl-4 text-ink")}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ children }) => (
    <code
      className={cn(
        poppins_400,
        "rounded bg-accent/10 px-1 py-0.5 text-xs text-ink"
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className={cn(
        poppins_400,
        "mb-2 overflow-x-auto rounded-lg bg-accent/10 p-3 text-xs text-ink"
      )}
    >
      {children}
    </pre>
  ),
};

const SUGGESTIONS = [
  { emoji: "🕌", question: "What are the 5 pillars of Islam?" },
  { emoji: "🤲", question: "Explain the importance of Salah" },
  { emoji: "✨", question: "Tell me about Prophet Muhammad ﷺ" },
  { emoji: "📖", question: "How do I perform Wudu correctly?" },
];

const AiAvatar = ({ size = 32 }) => (
  <span
    className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
    style={{ width: size, height: size }}
  >
    <Image
      src="/images/ai.png"
      alt="DeenBridge AI"
      width={size}
      height={size}
      className="h-full w-full object-cover"
    />
  </span>
);

function Dashboard({ chatData, onChatUpdate, onOpenSidebar }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial chat history from the AI backend on mount
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const data = await loadChatHistory(user.id, true);
        if (data.chats?.length > 0) {
          const latestChat = data.chats[0];
          setChatId(latestChat.chat_id);
          const history = await loadChatMessages(latestChat.chat_id);
          setMessages(history);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    load();
  }, [user?.id]);

  // Sync with chatData from layout when sidebar selection changes
  useEffect(() => {
    if (chatData?.chatId !== undefined) {
      setMessages(chatData.messages || []);
      setChatId(chatData.chatId);
    }
  }, [chatData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setStreamingContent("");

    try {
      await streamChat({
        message: userMessage,
        chatId,
        userId: user?.id,
        onChunk: (text) => {
          setStreamingContent((prev) => prev + text);
        },
        onComplete: ({ chatId: newChatId, history, response }) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response },
          ]);
          setStreamingContent("");

          if (newChatId && newChatId !== chatId) {
            setChatId(newChatId);
            if (onChatUpdate) {
              onChatUpdate(newChatId);
            }
          }
        },
        onError: (error) => {
          throw error;
        },
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error(
        error.message || "Failed to get AI response. Please try again."
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-full flex-col bg-surface">
      <h1 className="sr-only">DeenBridge AI Assistant</h1>
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-accent/10 px-3 py-2.5 sm:px-4">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-accent/10 hover:text-accent md:hidden"
            aria-label="Open chat history"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <AiAvatar size={28} />
          <div className="leading-tight">
            <p className={cn(poppins_600, "text-sm text-ink")}>DeenBridge AI</p>
            <p className={cn(poppins_400, "text-[11px] text-ink-muted")}>
              Qur&apos;an &amp; Hadith assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/20 to-highlight/20 blur-2xl" />
              <div className="relative rounded-full border-4 border-accent/20 bg-surface-raised p-2 shadow-xl">
                <Image
                  src="/images/ai.png"
                  alt="DeenBridge AI Assistant"
                  width={96}
                  height={96}
                  className="rounded-full"
                  priority
                />
              </div>
            </div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent sm:text-3xl"
              )}
            >
              Assalamu Alaikum!
            </h1>
            <p
              className={cn(
                poppins_400,
                "mt-3 max-w-md leading-relaxed text-ink-muted"
              )}
            >
              I&apos;m your Islamic AI assistant, grounded in the{" "}
              <span className={cn(poppins_600, "text-secondary")}>Qur&apos;an</span>{" "}
              and{" "}
              <span className={cn(poppins_600, "text-highlight")}>Hadith</span>.
              How can I help you today?
            </p>

            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(item.question)}
                  className="group flex items-center gap-3 rounded-xl border border-accent/15 bg-surface-raised p-4 text-left transition-all hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-sm"
                >
                  <span className="text-2xl transition-transform group-hover:scale-110">
                    {item.emoji}
                  </span>
                  <span className={cn(poppins_500, "text-sm text-ink")}>
                    {item.question}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-3 py-6 sm:px-4">
            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="flex justify-end gap-3">
                  <div
                    className={cn(
                      poppins_400,
                      "max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-accent/10 px-4 py-2.5 text-sm text-ink"
                    )}
                  >
                    {message.content}
                  </div>
                  <Avatar className="mt-0.5 h-8 w-8 shrink-0 rounded-full">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback
                      className={cn(poppins_500, "bg-accent text-xs text-white")}
                    >
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div key={index} className="flex gap-3">
                  <AiAvatar size={32} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <ReactMarkdown components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            )}

            {isLoading && !streamingContent && (
              <div className="flex gap-3">
                <AiAvatar size={32} />
                <div
                  className={cn(
                    poppins_400,
                    "flex items-center gap-2 pt-1.5 text-sm text-ink-muted"
                  )}
                >
                  <Bot className="size-4 animate-bounce text-accent" />
                  Thinking…
                </div>
              </div>
            )}

            {isLoading && streamingContent && (
              <div className="flex gap-3">
                <AiAvatar size={32} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <ReactMarkdown components={markdownComponents}>
                    {streamingContent}
                  </ReactMarkdown>
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-accent/10 bg-surface px-3 py-3 sm:px-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-accent/15 bg-surface-raised shadow-sm transition-shadow focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20"
        >
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Message DeenBridge AI…  (Enter to send, Shift+Enter for newline)"
            className={cn(
              poppins_400,
              "min-h-12 resize-none border-0 bg-transparent p-3 text-ink shadow-none focus-visible:ring-0"
            )}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-0">
            <div className="flex items-center gap-1">
              {[
                { icon: Paperclip, label: "Attach File" },
                { icon: ImageIcon, label: "Attach Image" },
                { icon: Mic, label: "Use Microphone" },
              ].map(({ icon: Icon, label }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <Icon className="size-4" />
                      <span className="sr-only">{label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={cn(
                poppins_500,
                "flex size-9 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
              )}
              aria-label="Send message"
            >
              <CornerDownLeft className="size-4" />
            </button>
          </div>
        </form>
        <p
          className={cn(
            poppins_400,
            "mx-auto mt-2 max-w-3xl text-center text-[11px] text-ink-muted"
          )}
        >
          DeenBridge AI can make mistakes — verify important rulings with a
          qualified scholar.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { chatData, onChatUpdate, onOpenSidebar } = useAiLayout();

  return (
    <Dashboard
      chatData={chatData}
      onChatUpdate={onChatUpdate}
      onOpenSidebar={onOpenSidebar}
    />
  );
}
