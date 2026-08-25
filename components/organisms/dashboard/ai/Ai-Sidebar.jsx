"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { config } from "@/lib/config/env";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

export function AiSidebar({ onChatSelect, currentChatId, onNewChat }) {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const AI_API_URL = config.aiApiUrl;

  useEffect(() => {
    if (user?.id) {
      fetchUserChats(user.id);
    }
  }, [currentChatId, user?.id]);

  const fetchUserChats = async (userId) => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`${AI_API_URL}/user/${userId}/chats`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chats || []);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteChat = async (chatIdToDelete, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${AI_API_URL}/chat/${chatIdToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Chat deleted");
        setChatHistory((prev) =>
          prev.filter((chat) => chat.chat_id !== chatIdToDelete)
        );
        if (currentChatId === chatIdToDelete && onNewChat) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
      toast.success("New chat started");
    }
  };

  const handleChatSelect = async (chatId) => {
    try {
      const historyResponse = await fetch(
        `${AI_API_URL}/chat/${chatId}/history`
      );
      if (historyResponse.ok) {
        const raw = await historyResponse.json();
        // Backend returns {role, text} — map to {role, content}
        const history = (raw || []).map((msg) => ({
          role: msg.role === "model" ? "assistant" : msg.role,
          content: msg.text || msg.content || "",
        }));
        if (onChatSelect) {
          onChatSelect(chatId, history);
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
    }
  };

  return (
    <div className="flex h-full flex-col p-3">
      {/* New chat */}
      <button
        onClick={handleNewChat}
        className={cn(
          poppins_500,
          "mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/15 bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:border-secondary/40 hover:bg-secondary/5"
        )}
      >
        <Plus className="h-4 w-4 text-accent" />
        New chat
      </button>

      <p
        className={cn(
          poppins_500,
          "px-1 pb-2 pt-1 text-[11px] uppercase tracking-wider text-ink-muted"
        )}
      >
        Recent chats
      </p>

      {/* History */}
      <div className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-accent" />
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <p className={cn(poppins_500, "text-sm text-ink")}>
              No chat history yet
            </p>
            <p className={cn(poppins_400, "mt-1 text-xs text-ink-muted")}>
              Start a conversation
            </p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div
              key={chat.chat_id}
              className={cn(
                "group relative flex items-center rounded-lg transition-colors",
                chat.chat_id === currentChatId
                  ? "bg-accent/10"
                  : "hover:bg-secondary/5"
              )}
            >
              <button
                onClick={() => handleChatSelect(chat.chat_id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left"
              >
                <MessageSquare
                  className={cn(
                    "h-4 w-4 shrink-0",
                    chat.chat_id === currentChatId
                      ? "text-accent"
                      : "text-ink-muted"
                  )}
                />
                <span className={cn(poppins_500, "truncate text-sm text-ink")}>
                  {chat.title || "New conversation"}
                </span>
              </button>
              <button
                onClick={(e) => deleteChat(chat.chat_id, e)}
                className="mr-1 shrink-0 rounded p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-red-600/10 hover:text-red-600 group-hover:opacity-100"
                aria-label="Delete chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
