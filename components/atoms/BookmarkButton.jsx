import React from "react";
import { Bookmark, BookmarkCheck, CirclePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable BookmarkButton component with consistent filled/outlined and loading states.
 *
 * @param {Object} props
 * @param {boolean} props.isBookmarked - Bookmark active state
 * @param {boolean} [props.loading] - Loading state during API request
 * @param {function} props.onClick - Click handler
 * @param {string} [props.variant="course"] - "course" | "book" icon variant
 * @param {string} [props.title] - Hover title
 * @param {string} [props.ariaLabel] - Accessible label
 * @param {string} [props.className] - Additional class names
 */
const BookmarkButton = ({
  isBookmarked,
  loading = false,
  onClick,
  variant = "course",
  title,
  ariaLabel,
  className,
}) => {
  const defaultTitle = isBookmarked ? "Remove bookmark" : "Add bookmark";
  const buttonTitle = title || defaultTitle;
  const buttonAriaLabel = ariaLabel || defaultTitle;

  if (variant === "book") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        title={buttonTitle}
        aria-label={buttonAriaLabel}
        className={cn(
          "flex items-center justify-center rounded-full p-1.5 transition-all",
          "hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          isBookmarked ? "bg-accent text-white" : "text-accent",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <CirclePlus
            className="w-6 h-6"
            strokeWidth={1.75}
            fill={isBookmarked ? "currentColor" : "none"}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={buttonTitle}
      aria-label={buttonAriaLabel}
      className={cn(
        "transition-all hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1",
        loading ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-6 h-6 text-accent fill-accent" />
      ) : (
        <Bookmark className="w-6 h-6 text-accent hover:fill-accent/20" />
      )}
    </button>
  );
};

export default BookmarkButton;
