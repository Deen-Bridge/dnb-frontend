"use client";
import { useEffect, useState } from "react";

/**
 * Delays propagation of a rapidly changing value. Used to keep the library
 * search box from re-filtering on every keystroke.
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}