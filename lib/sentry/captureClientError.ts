"use client";

export const captureClientError = (error: unknown): Promise<string | undefined> => {
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
