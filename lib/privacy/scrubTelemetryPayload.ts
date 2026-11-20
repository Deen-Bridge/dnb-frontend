const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const STELLAR_SECRET_REGEX = /\bS[A-Z2-7]{55}\b/g;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;

const SENSITIVE_KEYS = new Set([
  "email",
  "password",
  "token",
  "authorization",
  "secret",
  "seed",
  "message",
  "filename",
]);

export function scrubSensitiveString(value: string): string {
  return value
    .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
    .replace(STELLAR_SECRET_REGEX, "[REDACTED_STELLAR_SEED]")
    .replace(BEARER_REGEX, "Bearer [REDACTED_TOKEN]");
}

export function scrubBrowserTelemetryPayload<T extends Record<string, unknown>>(
  payload: T
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "string") {
      sanitized[key] = scrubSensitiveString(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}
