// Only routes in this allowlist may be stored as navigation responses.
// Authenticated and account-specific pages must always be fetched from the
// network so a shared browser cannot replay one user's HTML to another user.
export const PRIVATE_NAVIGATION_PREFIXES = [
  "/dashboard",
  "/account",
  "/admin",
  "/scholarships",
  "/payment",
  "/payments",
  "/messages",
  "/chat",
  "/settings",
  "/profile",
  "/library",
  "/my-courses",
  "/my-books",
];

export const PUBLIC_NAVIGATION_PREFIXES = [
  "/",
  "/about",
  "/contact",
  "/courses",
  "/books",
  "/authors",
  "/login",
  "/register",
  "/offline",
];

export const PRIVATE_RUNTIME_CACHE_NAMES = [
  "pages",
  "same-origin-others",
  "book-previews",
];

const matchesPrefix = (pathname, prefixes) =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export const isPrivateNavigationPath = (pathname) =>
  matchesPrefix(pathname, PRIVATE_NAVIGATION_PREFIXES);

export const isPublicNavigationPath = (pathname) =>
  !isPrivateNavigationPath(pathname) &&
  matchesPrefix(pathname, PUBLIC_NAVIGATION_PREFIXES);
