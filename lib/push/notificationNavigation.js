const FALLBACK_PATH = "/dashboard";
const LOCALES = new Set(["en", "ar"]);
const ALLOWED_PREFIXES = [
  "/account",
  "/courses",
  "/dashboard",
  "/library",
  "/messages",
  "/spaces",
];
const SAFE_QUERY_KEYS = new Set([
  "bookId",
  "courseId",
  "filter",
  "id",
  "notificationId",
  "page",
  "room",
  "tab",
  "view",
]);

function isAllowedPath(pathname) {
  const path = pathname.replace(/\/{2,}/g, "/");
  const withoutLocale = LOCALES.has(path.split("/")[1])
    ? `/${path.split("/").slice(2).join("/")}`
    : path;
  return ALLOWED_PREFIXES.some(
    (prefix) => withoutLocale === prefix || withoutLocale.startsWith(`${prefix}/`)
  );
}

/**
 * Convert an untrusted push target into a same-origin, application route.
 * External URLs, dangerous schemes, malformed escapes, and non-app paths all
 * resolve to the dashboard. Only known query keys survive normalization.
 */
export function normalizeNotificationTarget(value, origin = "https://deenbridge.app") {
  if (typeof value !== "string" || !value.trim()) return FALLBACK_PATH;

  let parsed;
  try {
    parsed = new URL(value, origin);
  } catch {
    return FALLBACK_PATH;
  }

  if (parsed.origin !== origin || !/^https?:$/.test(parsed.protocol)) {
    return FALLBACK_PATH;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return FALLBACK_PATH;
  }

  if (
    pathname.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(pathname) ||
    !isAllowedPath(pathname)
  ) {
    return FALLBACK_PATH;
  }

  const query = new URLSearchParams();
  for (const [key, queryValue] of parsed.searchParams) {
    if (!SAFE_QUERY_KEYS.has(key) || /[\u0000-\u001f\u007f\\]/.test(queryValue)) {
      continue;
    }
    query.append(key, queryValue);
  }

  const normalized = pathname.replace(/\/{2,}/g, "/");
  return `${normalized}${query.toString() ? `?${query}` : ""}`;
}

export { FALLBACK_PATH };
