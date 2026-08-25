/**
 * Canonical site URL, resolved in priority order.
 *
 * Without this, Next has no metadataBase and every relative OG/Twitter image
 * resolves against localhost — so social cards and Google's crawler get a URL
 * they cannot fetch.
 *
 * On Vercel:
 *   VERCEL_PROJECT_PRODUCTION_URL — the stable production domain
 *   VERCEL_URL                    — the per-deployment URL (changes every push)
 * Set NEXT_PUBLIC_SITE_URL once you point a custom domain at the project.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

// Preview deployments must not be indexed — they would compete with production
// for the same content and split ranking signals.
export const isProduction =
  process.env.VERCEL_ENV === "production" ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

export const siteName = "Deen Bridge";

export const siteDescription =
  "Authentic Islamic education — courses, a curated library, live community spaces, and an AI assistant that cites its sources. Educators are paid directly in USDC on Stellar.";

/** Public routes worth putting in the sitemap, with crawl priorities. */
export const publicRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/ai", priority: 0.9, changeFrequency: "monthly" },
  { path: "/stellar", priority: 0.8, changeFrequency: "monthly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/educators", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];
