"use client";
import React, { useState, useEffect } from "react";
import { AiSidebar } from "@/components/organisms/dashboard/ai/Ai-Sidebar";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatData, setChatData] = useState({ messages: [], chatId: null });
  const pathname = usePathname();

  const handleChatSelect = (chatId, history) => {
    setCurrentChatId(chatId);
    setChatData({ messages: history, chatId });
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setChatData({ messages: [], chatId: null });
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-2 sm:p-4 h-full">
        {/* Left Side List - Always visible on desktop, conditional on mobile */}
        <div
          className={`bg-muted/50 hidden sm:block rounded-xl p-2 sm:p-4 h-full overflow-y-auto scrollbar-hide transition-all duration-300 md:w-[300px] lg:w-[360px]`}
        >
          <AiSidebar
            onChatSelect={handleChatSelect}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Chat Panel (right side) */}
        <div className=" transition-all duration-300 h-full w-full rounded-xl">
          {/* Pass chatData to children */}
          {children &&
            typeof children === "object" &&
            React.cloneElement(children, {
              chatData,
              onChatUpdate: setCurrentChatId,
            })}
        </div>
      </div>
    </div>
  );
}
