"use client";

/**
 * Safe wrapper around Sentry.captureException for client components.
 * Dynamically imports the SDK so rendering never breaks when it is
 * unavailable or no DSN is configured; resolves to undefined instead of
 * throwing.
 */
export const captureClientError = (error) => {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  return import("@sentry/nextjs")
    .then((mod) => {
      const Sentry = mod.default ?? mod;
      if (!Sentry || typeof Sentry.captureException !== "function") {
        return undefined;
      }
      return Sentry.captureException(error);
    })
    .catch(() => undefined);
};
