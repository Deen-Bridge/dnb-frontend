const STORAGE_KEY = "dnb:analytics-consent:v1";
export type AnalyticsConsent = "unknown" | "granted" | "denied";

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return "unknown";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, "unknown">): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent("dnb:analytics-consent", { detail: value }));
}

export function canSendAnalytics(): boolean {
  return readAnalyticsConsent() === "granted";
}

/** Strip data that must never enter optional analytics payloads. */
export function minimizeAnalyticsPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const blocked = /token|secret|password|payment|wallet|message|url|identifier|email/i;
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !blocked.test(key)));
}
