"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useMediaBlurContext } from "@/contexts/MediaBlurContext";

/**
 * Inline toggle for the global media-blur gate (#268)
 *
 * Drop this into any admin page header or toolbar to let moderators flip
 * the blur setting on the fly. When `prefers-reduced-motion` is active
 * the toggle is visually disabled with an explanatory hint.
 *
 * @example
 * ```jsx
 * <MediaBlurToggle />
 * ```
 *
 * @param {object} props
 * @param {string} [props.className] – Extra classes on the wrapper.
 * @param {string} [props.label]     – Custom label text.
 * @param {string} [props.description] – Custom description text.
 */
export default function MediaBlurToggle({
  className,
  label = "Blur media by default",
  description,
}) {
  const { blurEnabled, toggleBlur, reducedMotion, loaded } =
    useMediaBlurContext();

  if (!loaded) return null;

  const defaultDescription = reducedMotion
    ? "Disabled — your OS prefers reduced motion"
    : "Sensitive images are blurred until hovered or clicked";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Label
          htmlFor="media-blur-toggle"
          className={cn(
            "text-sm font-medium leading-none cursor-pointer",
            reducedMotion && "opacity-50 cursor-not-allowed",
          )}
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground leading-snug">
          {description || defaultDescription}
        </p>
      </div>

      <Switch
        id="media-blur-toggle"
        checked={blurEnabled}
        onCheckedChange={toggleBlur}
        disabled={reducedMotion}
        aria-label="Toggle media blur"
      />
    </div>
  );
}
