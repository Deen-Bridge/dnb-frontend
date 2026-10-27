/**
 * Leveled logger — the single sanctioned place for console output in the app.
 *
 * Usage rules (see #506 / #513):
 *  - `debug` / `info` are development-only diagnostics: they are dropped in
 *    production so stray debugging never reaches a production console.
 *  - `warn` / `error` always emit. `error` additionally forwards the error to
 *    Sentry when the SDK is available; the import is dynamic and failure to
 *    load it is swallowed, so logging never throws.
 *  - Never pass personal or sensitive data to any level: no emails, no user
 *    objects, no tokens, no payment payloads, no raw request/response bodies.
 *
 * Works in both server and client code — it only touches `console` and a
 * dynamically imported Sentry module, neither of which requires a particular
 * runtime.
 */

type CaptureException = (error: unknown) => unknown;

interface SentryModuleLike {
  captureException?: CaptureException;
  default?: { captureException?: CaptureException };
}

function isProduction(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.env === "object" &&
    process.env !== null &&
    process.env.NODE_ENV === "production"
  );
}

/** Pick the first real `Error` out of the arguments, if any. */
function toError(args: unknown[]): Error | undefined {
  const nested = args.find((arg): arg is Error => arg instanceof Error);
  if (nested) return nested;
  if (typeof args[0] === "string") return new Error(args[0]);
  return undefined;
}

/** Best-effort Sentry forward; never throws and never blocks the caller. */
function forwardToSentry(error: Error): void {
  void import("@sentry/nextjs")
    .then((mod) => {
      const sentry = mod as SentryModuleLike;
      const capture = sentry.captureException ?? sentry.default?.captureException;
      if (typeof capture === "function") capture(error);
    })
    .catch(() => undefined);
}

export const logger = {
  /** Development-only detail. Silenced in production. */
  debug(...args: unknown[]): void {
    if (isProduction()) return;
    console.debug(...args);
  },

  /** Development-only informational message. Silenced in production. */
  info(...args: unknown[]): void {
    if (isProduction()) return;
    console.info(...args);
  },

  /** Something recoverable went wrong. Always emitted. */
  warn(...args: unknown[]): void {
    console.warn(...args);
  },

  /** Something failed. Always emitted, and forwarded to Sentry when possible. */
  error(...args: unknown[]): void {
    console.error(...args);
    const error = toError(args);
    if (error) forwardToSentry(error);
  },
};

export default logger;