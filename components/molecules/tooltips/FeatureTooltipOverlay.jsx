"use client";
/**
 * FeatureTooltipOverlay — renders all active feature tooltips (#304)
 * -------------------------------------------------------------------
 * Portal-based overlay that renders FeatureTooltip components for
 * all currently active feature highlights. Ensures tooltips don't
 * break page layout and fail gracefully.
 *
 * Place this component near the root of your app, after
 * FeatureTooltipProvider.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FeatureTooltip from "./FeatureTooltip";
import { useFeatureTooltipContext } from "@/contexts/FeatureTooltipContext";

/**
 * FeatureTooltipOverlay component
 * Renders active tooltips in a portal to avoid z-index issues
 */
export default function FeatureTooltipOverlay() {
  const [mounted, setMounted] = useState(false);
  const context = useFeatureTooltipContext();

  const { activeTooltips, dismissTooltip, isInitialized } = context;

  // Wait for client-side mount before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until initialized and mounted
  if (!mounted || !isInitialized) return null;

  // No tooltips to show
  if (activeTooltips.length === 0) return null;

  // Render tooltips in a portal
  return createPortal(
    <div
      className="feature-tooltip-overlay"
      aria-label="Feature announcements"
      data-testid="feature-tooltip-overlay"
    >
      {activeTooltips.map((highlight) => (
        <FeatureTooltip
          key={highlight.id}
          highlight={highlight}
          onDismiss={dismissTooltip}
        />
      ))}
    </div>,
    document.body
  );
}

/**
 * Standalone wrapper that includes its own provider
 * Use this if you want tooltips without setting up the full context
 */
export function FeatureTooltipsStandalone({ highlights }) {
  // This is a simplified version for standalone use
  // For full functionality, use FeatureTooltipProvider + FeatureTooltipOverlay

  const [dismissed, setDismissed] = useState(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dismissed from localStorage
    try {
      const stored = localStorage.getItem("dnb_feature_tooltips_dismissed");
      if (stored) {
        setDismissed(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const handleDismiss = (id) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(
          "dnb_feature_tooltips_dismissed",
          JSON.stringify([...next])
        );
      } catch {
        // Ignore errors
      }
      return next;
    });
  };

  if (!mounted) return null;

  const activeTooltips = highlights
    .filter((h) => !dismissed.has(h.id))
    .slice(0, 3);

  if (activeTooltips.length === 0) return null;

  return createPortal(
    <div className="feature-tooltip-overlay" aria-label="Feature announcements">
      {activeTooltips.map((highlight) => (
        <FeatureTooltip
          key={highlight.id}
          highlight={highlight}
          onDismiss={handleDismiss}
        />
      ))}
    </div>,
    document.body
  );
}
