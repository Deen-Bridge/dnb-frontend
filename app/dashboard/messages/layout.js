"use client";
import MessagesHeadSideList from "@/components/molecules/dashboard/messages/MessagesHeadSideList";
import { useState, useEffect } from "react";
import { fetchUserConversations } from "@/lib/actions/messages/fetchConversations";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Layout({ children }) {
  const [hasConversations, setHasConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isInChat = pathname !== "/dashboard/messages";
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return; // ✅ Don't even try

    const checkConversations = async () => {
      try {
        const conversations = await fetchUserConversations(user._id);
        setHasConversations(conversations.length > 0);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setHasConversations(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConversations();
  }, [user?._id]);
  

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-2 sm:p-4 h-full">
        {/* Left Side List - Always visible on desktop, conditional on mobile */}
        <div
          className={`bg-muted rounded-xl p-2 sm:p-4 h-full overflow-y-auto scrollbar-hide transition-all duration-300 ${
            isInChat ? "hidden md:block" : "block"
          } md:w-1/3 lg:w-1/4`}
        >
          <MessagesHeadSideList />
        </div>

        {/* Chat Panel (right side) */}
        <div
          className={`bg-muted rounded-xl flex flex-col p-2 sm:p-4 transition-all duration-300 ${
            isInChat ? "md:flex-1" : "w-full"
          } h-full overflow-hidden`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
