import { siteUrl, isProduction } from "@/lib/config/site.config";

export default function robots() {
  // Preview and branch deployments get a blanket disallow so they never
  // compete with production in the index.
  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in surfaces: nothing to index, and much of it needs auth.
        disallow: [
          "/dashboard/",
          "/account/",
          "/api/",
          "/login",
          "/signup",
          "/verify-email",
          "/profile-setup",
          "/offline",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
