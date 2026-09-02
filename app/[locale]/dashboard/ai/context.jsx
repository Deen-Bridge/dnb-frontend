"use client";

import { createContext, useContext } from "react";

const AiLayoutContext = createContext({
  chatData: { messages: [], chatId: null },
  onChatUpdate: null,
  onOpenSidebar: null,
});

export function AiLayoutProvider({ value, children }) {
  return <AiLayoutContext.Provider value={value}>{children}</AiLayoutContext.Provider>;
}

export function useAiLayout() {
  return useContext(AiLayoutContext);
}
