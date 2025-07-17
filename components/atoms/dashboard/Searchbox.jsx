import React, { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { poppins_400 } from "@/lib/config/font.config";

const Searchbox = ({ className, placeholder, onSearch }) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      if (onSearch) onSearch(value.trim());
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-[#F7F7F7] rounded-full px-4 py-2 border border-accent transition-all w-full",
        className
      )}
    >
      <Search size={18} className="text-accent" />
      <input
        type="search"
        placeholder={placeholder || "Search..."}
        className={cn(
          "bg-transparent text-sm w-full outline-none border-none placeholder:text-gray-500",
          poppins_400.className
        )}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Searchbox;
