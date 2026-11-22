const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN = /\b(?:bearer\s+)?[A-Z0-9_-]{20,}\b/gi;
const WALLET = /\b(?:G|M)[A-Z2-7]{55}\b/g;
const REDACTED = "[redacted]";
const SENSITIVE_KEYS = /token|authorization|cookie|email|message|wallet|payment|document|password|secret/i;

export function scrubDiagnosticValue(value: unknown, key = ""): unknown {
  if (SENSITIVE_KEYS.test(key)) return REDACTED;
  if (typeof value === "string") {
    return value.replace(EMAIL, "[redacted-email]").replace(WALLET, REDACTED).replace(TOKEN, REDACTED);
  }
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => scrubDiagnosticValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).slice(0, 50).map(([childKey, childValue]) => [childKey, scrubDiagnosticValue(childValue, childKey)])
    );
  }
  return value;
}

export function scrubRoute(route: string | undefined): string {
  if (!route) return "unknown";
  const path = route.split("?")[0].split("#")[0];
  return path.replace(/\/[A-Za-z0-9_-]{16,}/g, "/:id").slice(0, 120);
}
