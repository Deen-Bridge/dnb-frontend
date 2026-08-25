"use client";
/**
 * FeatureTooltip — single feature announcement tooltip (#304)
 * -----------------------------------------------------------
 * Renders a positioned tooltip anchored to a DOM element specified
 * by CSS selector. Handles positioning, animations, and dismissal.
 *
 * Features:
 * - Auto-positioning based on anchor element
 * - Smooth fade-in/out animations
 * - Keyboard accessible (Escape to dismiss)
 * - Click-away to dismiss
 * - "Got it" button for explicit dismissal
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Calculate tooltip position relative to anchor element
 * @param {Element} anchor
 * @param {'top' | 'bottom' | 'left' | 'right'} placement
 * @param {number} offset
 * @returns {{ top: number, left: number, arrowPosition: string }}
 */
function calculatePosition(anchor, placement = "bottom", offset = 12) {
  const rect = anchor.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let top = 0;
  let left = 0;
  let arrowPosition = "top";

  switch (placement) {
    case "top":
      top = rect.top + scrollY - offset;
      left = rect.left + scrollX + rect.width / 2;
      arrowPosition = "bottom";
      break;
    case "bottom":
      top = rect.bottom + scrollY + offset;
      left = rect.left + scrollX + rect.width / 2;
      arrowPosition = "top";
      break;
    case "left":
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - offset;
      arrowPosition = "right";
      break;
    case "right":
      top = rect.top + scrollY + rect.height / 2;
      left = rect.right + scrollX + offset;
      arrowPosition = "left";
      break;
    default:
      top = rect.bottom + scrollY + offset;
      left = rect.left + scrollX + rect.width / 2;
      arrowPosition = "top";
  }

  return { top, left, arrowPosition };
}

/**
 * FeatureTooltip component
 * @param {Object} props
 * @param {Object} props.highlight - The highlight definition
 * @param {Function} props.onDismiss - Callback when dismissed
 * @param {string} [props.className] - Additional CSS classes
 */
export default function FeatureTooltip({ highlight, onDismiss, className }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const { id, selector, message, title, placement = "bottom" } = highlight;

  // Find and track anchor element
  useEffect(() => {
    const findAnchor = () => {
      try {
        const element = document.querySelector(selector);
        if (element) {
          setAnchor(element);
          return true;
        }
      } catch {
        // Invalid selector
      }
      return false;
    };

    // Initial check
    if (!findAnchor()) {
      // Retry with MutationObserver for dynamically rendered elements
      const observer = new MutationObserver(() => {
        if (findAnchor()) {
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Cleanup after 5 seconds if element never appears
      const timeout = setTimeout(() => {
        observer.disconnect();
      }, 5000);

      return () => {
        observer.disconnect();
        clearTimeout(timeout);
      };
    }
  }, [selector]);

  // Update position when anchor changes or on scroll/resize
  useEffect(() => {
    if (!anchor) return;

    const updatePosition = () => {
      const pos = calculatePosition(anchor, placement);
      setPosition(pos);
    };

    updatePosition();
    setIsVisible(true);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchor, placement]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onDismiss(id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [id, onDismiss]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        anchor &&
        !anchor.contains(e.target)
      ) {
        // Don't dismiss on click-outside by default to avoid accidental dismissals
        // Users must click "Got it" or press Escape
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anchor]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    // Wait for animation before calling onDismiss
    setTimeout(() => onDismiss(id), 150);
  }, [id, onDismiss]);

  // Don't render until we have position
  if (!position || !anchor) return null;

  const arrowClasses = {
    top: "before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-emerald-600",
    bottom: "before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-emerald-600",
    left: "before:absolute before:top-1/2 before:-left-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-emerald-600",
    right: "before:absolute before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-emerald-600",
  };

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-live="polite"
      className={cn(
        "fixed z-[9999] max-w-xs transform -translate-x-1/2",
        "bg-emerald-600 text-white rounded-lg shadow-lg",
        "transition-all duration-150 ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        arrowClasses[position.arrowPosition],
        placement === "left" && "translate-x-0 -translate-y-1/2",
        placement === "right" && "-translate-x-0 -translate-y-1/2",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
            )}
            <p className="text-sm text-emerald-50">{message}</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-emerald-500 transition-colors"
            aria-label="Dismiss tooltip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-3 w-full px-3 py-1.5 text-xs font-medium bg-white text-emerald-700 rounded hover:bg-emerald-50 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
