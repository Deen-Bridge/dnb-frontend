const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const STELLAR_SECRET_REGEX = /\bS[A-Z2-7]{55}\b/g;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;

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
    .replace(BEARER_REGEX, "Bearer [REDACTED_TOKEN]")
    .replace(URL_REGEX, "[REDACTED_URL]");
}

export function scrubBrowserTelemetryPayload<T extends Record<string, unknown>>(
  payload: T
): Record<string, unknown> {
  const scrub = (value: unknown, key?: string): unknown => {
    if (key && SENSITIVE_KEYS.has(key.toLowerCase())) return "[REDACTED]";
    if (typeof value === "string") return scrubSensitiveString(value);
    if (Array.isArray(value)) return value.map((item) => scrub(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([childKey, childValue]) => [
          childKey,
          scrub(childValue, childKey),
        ]),
      );
    }
    return value;
  };

  return scrub(payload) as Record<string, unknown>;
}

export const TELEMETRY_CONSENT_KEY = "dnb.telemetry.consent";

export type TelemetryConsent = "granted" | "denied";

export function getTelemetryConsent(): TelemetryConsent {
  if (typeof window === "undefined") return "denied";
  return window.localStorage.getItem(TELEMETRY_CONSENT_KEY) === "granted"
    ? "granted"
    : "denied";
}

export function setTelemetryConsent(consent: TelemetryConsent): void {
  if (typeof window === "undefined") return;
  if (consent === "granted") {
    window.localStorage.setItem(TELEMETRY_CONSENT_KEY, consent);
  } else {
    window.localStorage.removeItem(TELEMETRY_CONSENT_KEY);
  }
  window.dispatchEvent(new CustomEvent("dnb:telemetry-consent", { detail: consent }));
}
