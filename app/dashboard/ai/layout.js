"use client";
import { useState, useEffect } from "react";
import { AiSidebar } from "@/components/organisms/dashboard/ai/Ai-Sidebar";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-2 sm:p-4 h-full">
        {/* Left Side List - Always visible on desktop, conditional on mobile */}
        <div
          className={`bg-muted/50 hidden sm:block rounded-xl p-2 sm:p-4 h-full overflow-y-auto scrollbar-hide transition-all duration-300  md:w-1/3 lg:w-1/4`}
        >
          <AiSidebar />
        </div>

        {/* Chat Panel (right side) */}
        <div className=" transition-all duration-300 h-full w-full rounded-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
