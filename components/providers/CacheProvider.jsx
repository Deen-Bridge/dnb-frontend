"use client";
import { useEffect } from "react";
import { initCache } from "@/lib/utils/cache";

export default function CacheProvider({ children }) {
  useEffect(() => {
    // Initialize cache system on app mount
    initCache();
  }, []);

  return <>{children}</>;
}
