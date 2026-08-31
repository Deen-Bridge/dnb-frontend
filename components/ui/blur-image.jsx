"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMediaBlurContext } from "@/contexts/MediaBlurContext";

/**
 * Blurred media wrapper (#268)
 *
 * Wraps a Next.js `<Image>` (or any arbitrary children) with a privacy
 * blur that can be revealed on hover or click. When the global blur
 * preference is OFF or `prefers-reduced-motion` is active, no blur is
 * applied.
 *
 * @example
 * ```jsx
 * <BlurImage
 *   src="/images/cover.jpg"
 *   alt="Book cover"
 *   width={200}
 *   height={280}
 * />
 * ```
 *
 * @example With arbitrary children (drawer poster):
 * ```jsx
 * <BlurImage forceBlur>
 *   <img src="/poster.jpg" alt="..." className="w-full h-auto" />
 * </BlurImage>
 * ```
 *
 * @param {object} props
 * @param {string}        [props.src]        – Image source (Next.js Image).
 * @param {string}        [props.alt=""]     – Alt text.
 * @param {number}        [props.width]      – Width.
 * @param {number}        [props.height]     – Height.
 * @param {string}        [props.className]  – Extra classes on wrapper.
 * @param {boolean}       [props.forceBlur]  – Override: always blur
 *   regardless of global state (e.g. for drawer posters).
 * @param {React.ReactNode} [props.children] – Arbitrary children to wrap.
 */
export default function BlurImage({
  src,
  alt = "",
  width,
  height,
  className,
  forceBlur = false,
  children,
  ...rest
}) {
  const { blurEnabled, reducedMotion } = useMediaBlurContext();
  const [revealed, setRevealed] = useState(false);

  const shouldBlur = !reducedMotion && (forceBlur || blurEnabled);

  const handleReveal = useCallback(() => {
    if (shouldBlur) setRevealed(true);
  }, [shouldBlur]);

  const handleHide = useCallback(() => {
    if (shouldBlur) setRevealed(false);
  }, [shouldBlur]);

  const isBlurred = shouldBlur && !revealed;

  return (
    <div
      className={cn(
        "relative inline-block overflow-hidden group/media-blur",
        className,
      )}
      onMouseEnter={handleReveal}
      onMouseLeave={handleHide}
      onFocus={handleReveal}
      onBlur={handleHide}
      role={shouldBlur ? "button" : undefined}
      tabIndex={shouldBlur ? 0 : undefined}
      aria-label={
        shouldBlur && !revealed ? "Click or hover to reveal media" : undefined
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          revealed ? handleHide() : handleReveal();
        }
      }}
    >
      {/* Main content — either a Next.js Image or arbitrary children */}
      {children ?? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-[filter] duration-300",
            isBlurred && "blur-lg",
          )}
          draggable={!isBlurred}
          {...rest}
        />
      )}

      {/* Overlay that covers the blurred content */}
      {isBlurred && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-muted/60 backdrop-blur-md",
            "pointer-events-none select-none",
            "transition-opacity duration-300",
          )}
          aria-hidden="true"
        >
          <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-background/80 rounded">
            Hover or click to reveal
          </span>
        </div>
      )}
    </div>
  );
}
