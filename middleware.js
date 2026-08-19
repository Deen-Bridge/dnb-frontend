import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale negotiation + cookie persistence for every page request. The matcher
// deliberately skips API routes, Next internals, and any path containing a dot
// (static assets, `sw.js`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`,
// icons) so those keep serving untouched.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
