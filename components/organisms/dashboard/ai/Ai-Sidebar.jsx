"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Button from "@/components/atoms/form/Button";
import { config } from "@/lib/config/env";
import { useAuth } from "@/hooks/useAuth";

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

        // If we deleted the current chat, trigger new chat
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
    <div className="grid w-fit items-start gap-6 h-full">
      <fieldset className="grid gap-4 rounded-lg border p-4 h-full overflow-y-auto">
        <legend className="-ml-1 px-1 text-md font-medium">History</legend>

        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-accent text-white hover:bg-highlight"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>

        {/* Chat History */}
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-8 px-2">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No chat history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.chat_id}
                onClick={() => handleChatSelect(chat.chat_id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors group relative ${
                  chat.chat_id === currentChatId
                    ? "bg-accent/10 border-accent/20"
                    : "hover:bg-muted border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chat.title || "New conversation"}
                    </p>
                    {chat.snippet && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {chat.snippet}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {chat.message_count} messages
                      </p>
                      {chat.created_at && (
                        <p className="text-xs text-muted-foreground">
                          •{" "}
                          {formatDistanceToNow(new Date(chat.created_at * 1000), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.chat_id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
}
