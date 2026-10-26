const DEFAULT_FALLBACK_PATH = "/dashboard";
const SENTINEL_ORIGIN = "https://deenbridge.local";
const UNSAFE_PATH_CHARS = /[\p{Cc}\\]/u;
const REDIRECT_QUERY_KEYS = ["returnTo", "callbackUrl", "redirect", "next"] as const;

/**
 * Validates post-login and wallet callback redirect targets to prevent open-redirect phishing (#568).
 * Only single-slash relative internal paths are permitted; protocol-relative (`//evil.com`,
 * `/a/..//evil.com`), encoded separator tricks (`/%2f/evil.com`, `/%5cevil.com`), Unicode Cc
 * control characters (ASCII + C1), external URLs, and `javascript:`/`data:` schemes fall back
 * to `fallback` (default `/dashboard`).
 *
 * @param rawTarget - Untrusted redirect parameter value.
 * @param fallback - Safe internal path used when `rawTarget` is missing or rejected.
 * @returns Normalized internal path (`pathname + search + hash`) or `fallback`.
 */
export function resolveSafeRedirectTarget(
  rawTarget: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK_PATH
): string {
  if (!rawTarget || typeof rawTarget !== "string") {
    return fallback;
  }

  const trimmed = rawTarget.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || UNSAFE_PATH_CHARS.test(trimmed)) {
    return fallback;
  }

  let decodedOnce: string;
  try {
    decodedOnce = decodeURIComponent(trimmed.split(/[?#]/, 1)[0] ?? "");
  } catch {
    return fallback;
  }
  if (
    !decodedOnce.startsWith("/") ||
    decodedOnce.startsWith("//") ||
    UNSAFE_PATH_CHARS.test(decodedOnce)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, SENTINEL_ORIGIN);
    if (parsed.origin !== SENTINEL_ORIGIN) {
      return fallback;
    }
    if (
      !parsed.pathname.startsWith("/") ||
      parsed.pathname.startsWith("//") ||
      UNSAFE_PATH_CHARS.test(parsed.pathname)
    ) {
      return fallback;
    }
    let decodedPathname: string;
    try {
      decodedPathname = decodeURIComponent(parsed.pathname);
    } catch {
      return fallback;
    }
    if (
      !decodedPathname.startsWith("/") ||
      decodedPathname.startsWith("//") ||
      UNSAFE_PATH_CHARS.test(decodedPathname)
    ) {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Extracts a post-login or wallet-callback redirect target from a URL query string
 * (`returnTo`, `callbackUrl`, `redirect`, or `next`) and validates it against open redirects.
 *
 * @param search - `window.location.search` (may be empty or undefined).
 * @param fallback - Safe role-appropriate default path (e.g. `/dashboard` or `/admin`).
 * @returns Validated internal redirect target or `fallback`.
 */
export function resolveSafeCallbackRedirect(
  search: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK_PATH
): string {
  if (!search || typeof search !== "string") {
    return fallback;
  }
  const params = new URLSearchParams(search);
  for (const key of REDIRECT_QUERY_KEYS) {
    const candidate = params.get(key);
    if (candidate !== null) {
      return resolveSafeRedirectTarget(candidate, fallback);
    }
  }
  return fallback;
}
