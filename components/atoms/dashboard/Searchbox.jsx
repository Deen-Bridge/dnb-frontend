"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400 } from "@/lib/config/font.config";

const Searchbox = ({ className, placeholder }) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.userAgent.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  const openPalette = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-command-palette"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPalette();
    }
  };

  const placeholderText = Array.isArray(placeholder)
    ? `Search ${placeholder.join(", ")}...`
    : placeholder || "Search courses, books, spaces...";

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="global-search-trigger" className="sr-only">
        Search courses, books, educators, and spaces (Press ⌘K)
      </label>
      <button
        id="global-search-trigger"
        type="button"
        onClick={openPalette}
        onKeyDown={handleKeyDown}
        aria-label="Open command palette (⌘K)"
        className={cn(
          "flex items-center justify-between gap-2 bg-[#F7F7F7] hover:bg-gray-100 rounded-full px-4 py-2 border border-accent/40 hover:border-accent transition-all w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent",
          poppins_400.className
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <Search size={18} className="text-accent shrink-0" />
          <span className="text-sm text-gray-600 truncate">
            {placeholderText}
          </span>
        </div>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-gray-600 shadow-xs shrink-0">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>
    </div>
  );
};
export default Searchbox;