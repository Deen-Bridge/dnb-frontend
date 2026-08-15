"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { AiSidebar } from "@/components/organisms/dashboard/ai/Ai-Sidebar";

export default function Layout({ children }) {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatData, setChatData] = useState({ messages: [], chatId: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChatSelect = (chatId, history) => {
    setCurrentChatId(chatId);
    setChatData({ messages: history, chatId });
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setChatData({ messages: [], chatId: null });
    setSidebarOpen(false);
  };

  const sidebar = (
    <AiSidebar
      onChatSelect={handleChatSelect}
      currentChatId={currentChatId}
      onNewChat={handleNewChat}
    />
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-accent/10 bg-surface-raised md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-basic/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85%] border-r border-accent/10 bg-surface-raised shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-accent/10 hover:text-accent"
              aria-label="Close chat history"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Chat panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {children &&
          typeof children === "object" &&
          React.cloneElement(children, {
            chatData,
            onChatUpdate: setCurrentChatId,
            onOpenSidebar: () => setSidebarOpen(true),
          })}
      </div>
    </div>
  );
}
