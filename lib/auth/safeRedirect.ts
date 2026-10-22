const DEFAULT_FALLBACK_PATH = "/dashboard";

/**
 * Validates post-login and wallet callback redirect targets to prevent open-redirect phishing (#568).
 * Only single-slash relative internal paths are permitted; protocol-relative (`//evil.com`),
 * external URLs (`https://evil.com`), and `javascript:`/`data:` schemes fall back to `/dashboard`.
 */
export function resolveSafeRedirectTarget(
  rawTarget: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK_PATH
): string {
  if (!rawTarget || typeof rawTarget !== "string") {
    return fallback;
  }

  const trimmed = rawTarget.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  if (/[\x00-\x1f\x7f]/.test(trimmed)) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://deenbridge.local");
    if (parsed.origin !== "https://deenbridge.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
