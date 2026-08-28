"use client";
/**
 * ErrorBoundaryUI — shared, design-system-consistent error state (#196).
 * ---------------------------------------------------------------------
 * Renders a user-friendly error screen with a **Try again** action (resets the
 * error state), a **Go home** fallback link, and an option to **report the
 * issue** (a mailto carrying the Sentry report ID when one was captured).
 *
 * Error messages are chosen by type — never raw stack traces:
 *   - Network errors → "Connection lost. Check your internet and try again."
 *   - Server errors  → "Something went wrong on our end. Please try again."
 *   - Not found      → friendly 404 message + Go home (real 404s render the
 *                       app's not-found.jsx via the framework).
 *   - Anything else  → generic message.
 *
 * Every route-level `error.jsx` composes this component so all boundaries share
 * the same copy, styling, and Sentry capture.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  WifiOff,
  ServerCrash,
  FileQuestion,
  AlertTriangle,
  RotateCcw,
  Home,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";
import { captureClientError } from "@/lib/sentry/captureClientError";

const KIND_CONFIG = {
  network: {
    icon: WifiOff,
    title: "Connection lost",
    description: "Check your internet connection and try again.",
  },
  server: {
    icon: ServerCrash,
    title: "Something went wrong on our end",
    description: "Please try again in a moment. Our team has been notified.",
  },
  notFound: {
    icon: FileQuestion,
    title: "Page not found",
    description: "We couldn't find what you were looking for.",
  },
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  },
};

/**
 * Classify an error into one of the handled kinds so the UI can show an
 * appropriate, non-technical message. Returns
 * "network" | "server" | "notFound" | "generic".
 *
 * @param {unknown} error
 * @returns {"network" | "server" | "notFound" | "generic"}
 */
export function classifyError(error) {
  const status = error?.response?.status ?? error?.status ?? error?.statusCode;
  const message = String(error?.message || error?.digest || "").toLowerCase();

  if (status === 404 || message.includes("not found")) return "notFound";

  const looksLikeNetwork =
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed") ||
    message.includes("econnaborted") ||
    message.includes("err_network") ||
    message.includes("socket hang up");
  if (looksLikeNetwork) return "network";

  if (typeof status === "number" && status >= 500) return "server";

  return "generic";
}

/**
 * @param {object} props
 * @param {unknown} props.error            The error captured by the boundary.
 * @param {() => void} [props.reset]       Reset callback (Next.js `reset`).
 * @param {string} [props.title]           Optional section-specific title.
 * @param {string} [props.description]     Optional section-specific description.
 * @param {string} [props.homeHref]        "Go home" fallback destination.
 * @param {string} [props.className]       Extra wrapper classes.
 */
export default function ErrorBoundaryUI({
  error,
  reset,
  title,
  description,
  homeHref = "/",
  className,
}) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    let active = true;
    captureClientError(error).then((id) => {
      if (active && id) setEventId(id);
    });
    return () => {
      active = false;
    };
  }, [error]);

  const kind = classifyError(error);
  const config = KIND_CONFIG[kind] || KIND_CONFIG.generic;
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const reportHref = eventId
    ? `mailto:support@deenbridge.org?subject=${encodeURIComponent(
        "DeenBridge error report"
      )}&body=${encodeURIComponent(
        `Report ID: ${eventId}\n\nPlease include what you were doing when this happened.`
      )}`
    : "mailto:support@deenbridge.org";

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="h-10 w-10 text-destructive" aria-hidden="true" />
      </div>
      <h1 className={cn(poppins_600.className, "mb-3 text-2xl text-foreground lg:text-3xl")}>
        {displayTitle}
      </h1>
      <p className={cn(poppins_400.className, "mb-8 max-w-md text-base text-muted-foreground")}>
        {displayDescription}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          className="rounded-full"
          onClick={() => (typeof reset === "function" ? reset() : undefined)}
        >
          <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button type="button" variant="outline" className="rounded-full" asChild>
          <Link href={homeHref}>
            <Home className="mr-1 h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </Button>
        <Button type="button" variant="ghost" className="rounded-full" asChild>
          <a href={reportHref}>
            <Bug className="mr-1 h-4 w-4" aria-hidden="true" />
            Report issue
          </a>
        </Button>
      </div>
      {eventId ? (
        <p className={cn(poppins_400.className, "mt-6 text-xs text-muted-foreground")}>
          Report ID: {eventId}
        </p>
      ) : null}
    </div>
  );
}
