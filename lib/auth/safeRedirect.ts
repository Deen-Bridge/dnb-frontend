const DEFAULT_FALLBACK_PATH = "/dashboard";
const SENTINEL_ORIGIN = "https://deenbridge.local";
const UNSAFE_PATH_CHARS = /[\p{Cc}\\]/u;
const REDIRECT_QUERY_KEYS = ["returnTo", "callbackUrl", "redirect", "next"] as const;
const SUPPORTED_LOCALES = new Set(["en", "ar"]);
const SAFE_DEEP_LINK_QUERY_KEYS = new Set(["tab", "view", "page", "filter"]);

export type AppLocale = "en" | "ar";

function normalizeLocale(locale: string | null | undefined): AppLocale {
  return locale === "ar" ? "ar" : "en";
}

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|ar)(?=\/|$)/);
  return match ? pathname.slice(match[0].length) || "/" : pathname;
}

/** Return the locale encoded in a pathname, falling back to the default locale. */
export function getLocaleFromPathname(pathname: string | null | undefined): AppLocale {
  const firstSegment = pathname?.match(/^\/([^/?#]+)/)?.[1];
  return firstSegment && SUPPORTED_LOCALES.has(firstSegment)
    ? normalizeLocale(firstSegment)
    : "en";
}

/** Prefix an already validated internal path using next-intl's as-needed policy. */
export function localizePath(pathname: string, locale: string | null | undefined): string {
  const safePath = resolveSafeRedirectTarget(pathname, "/");
  const unprefixedPath = stripLocalePrefix(safePath);
  return normalizeLocale(locale) === "ar"
    ? `/ar${unprefixedPath === "/" ? "" : unprefixedPath}`
    : unprefixedPath;
}

/** Build a locale-preserving login URL that safely returns to the current page. */
export function loginRedirectPath(
  pathname: string | null | undefined,
  reason?: string | null
): string {
  const locale = getLocaleFromPathname(pathname);
  const loginPath = localizePath("/login", locale);
  const returnTo = localizePath(pathname || "/", locale);
  const query = new URLSearchParams({ returnTo });
  if (reason) query.set("reason", reason);
  return `${loginPath}?${query.toString()}`;
}

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
  fallback: string = DEFAULT_FALLBACK_PATH,
  locale?: string | null
): string {
  const localizedFallback = locale ? localizePath(fallback, locale) : fallback;
  if (!rawTarget || typeof rawTarget !== "string") {
    return localizedFallback;
  }

  const trimmed = rawTarget.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || UNSAFE_PATH_CHARS.test(trimmed)) {
    return localizedFallback;
  }

  let decodedOnce: string;
  try {
    decodedOnce = decodeURIComponent(trimmed.split(/[?#]/, 1)[0] ?? "");
  } catch {
    return localizedFallback;
  }
  if (
    !decodedOnce.startsWith("/") ||
    decodedOnce.startsWith("//") ||
    UNSAFE_PATH_CHARS.test(decodedOnce)
  ) {
    return localizedFallback;
  }

  try {
    const parsed = new URL(trimmed, SENTINEL_ORIGIN);
    if (parsed.origin !== SENTINEL_ORIGIN) {
      return localizedFallback;
    }
    if (
      !parsed.pathname.startsWith("/") ||
      parsed.pathname.startsWith("//") ||
      UNSAFE_PATH_CHARS.test(parsed.pathname)
    ) {
      return localizedFallback;
    }
    let decodedPathname: string;
    try {
      decodedPathname = decodeURIComponent(parsed.pathname);
    } catch {
      return localizedFallback;
    }
    if (
      !decodedPathname.startsWith("/") ||
      decodedPathname.startsWith("//") ||
      UNSAFE_PATH_CHARS.test(decodedPathname)
    ) {
      return localizedFallback;
    }
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return locale ? localizePath(normalized, locale) : normalized;
  } catch {
    return localizedFallback;
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
  fallback: string = DEFAULT_FALLBACK_PATH,
  locale?: string | null
): string {
  if (!search || typeof search !== "string") {
    return locale ? localizePath(fallback, locale) : fallback;
  }
  const params = new URLSearchParams(search);
  for (const key of REDIRECT_QUERY_KEYS) {
    const candidate = params.get(key);
    if (candidate !== null) {
      return resolveSafeRedirectTarget(candidate, fallback, locale);
    }
  }
  return locale ? localizePath(fallback, locale) : fallback;
}

/** Validate a deep-link destination while dropping sensitive query state. */
export function resolveSafeDeepLink(
  rawTarget: string | null | undefined,
  locale: string = "en",
  fallback: string = "/dashboard",
): string {
  const target = resolveSafeRedirectTarget(rawTarget, fallback);
  if (target === fallback) return fallback;
  const parsed = new URL(target, SENTINEL_ORIGIN);
  const pathname = parsed.pathname.startsWith(`/${locale}/`)
    ? parsed.pathname
    : `/${locale}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  const safeQuery = new URLSearchParams();
  for (const [key, value] of parsed.searchParams) {
    if (SAFE_DEEP_LINK_QUERY_KEYS.has(key) && value.length <= 80) safeQuery.set(key, value);
  }
  return `${pathname}${safeQuery.toString() ? `?${safeQuery}` : ""}`;
}
