"use client";

import { createContext, useContext, useMemo } from "react";
import useMediaBlur from "@/hooks/useMediaBlur";

/**
 * Media Blur Context (#268)
 *
 * Provides global blur state to the admin panel. Wrap the admin layout
 * (or relevant subtree) with `<MediaBlurProvider>` so that any descendant
 * can consume `useMediaBlurContext()` without prop-drilling.
 */

const MediaBlurContext = createContext(null);

export function MediaBlurProvider({ children, overrideDefault = false }) {
  const value = useMediaBlur({ overrideDefault });

  return (
    <MediaBlurContext.Provider value={value}>
      {children}
    </MediaBlurContext.Provider>
  );
}

/**
 * Access the global media-blur state.
 *
 * @returns {{
 *   blurEnabled: boolean,
 *   toggleBlur: () => void,
 *   setBlur: (enabled: boolean) => void,
 *   reducedMotion: boolean,
 *   loaded: boolean,
 * }}
 * @throws When used outside a `<MediaBlurProvider>`.
 */
export function useMediaBlurContext() {
  const ctx = useContext(MediaBlurContext);
  if (ctx === null) {
    throw new Error(
      "useMediaBlurContext must be used within a <MediaBlurProvider>",
    );
  }
  return ctx;
}

export default MediaBlurContext;
