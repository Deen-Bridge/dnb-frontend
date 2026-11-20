import { siteUrl, publicRoutes } from "@/lib/config/site.config";
import { fetchEducators } from "@/lib/actions/educators/fetch-educators";
import { assertPublicSitemapEntries } from "@/lib/seo/sitemap-guards";

const API_TIMEOUT_MS = 5000;

/**
 * Guards the build (and first render) against a slow or unreachable backend.
 * CI builds against https://api.example.com, so detail routes must fall back
 * to the static list rather than failing the build.
 */
function withTimeout(promise, ms = API_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API request timed out")), ms)
    ),
  ]);
}

function safeDate(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function normalizeEducators(response) {
  if (Array.isArray(response)) return response;
  if (response?.educators) return response.educators;
  return [];
}

export default async function sitemap() {
  const lastModified = new Date();

  const staticEntries = publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  let educatorEntries = [];

  try {
    const educators = await withTimeout(fetchEducators());
    educatorEntries = normalizeEducators(educators).map((educator) => ({
      url: `${siteUrl}/educators/${educator._id || educator.id}`,
      lastModified: safeDate(educator.updatedAt, lastModified),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn(
      "sitemap: educator profile fetch failed, returning static routes only.",
      error?.message ?? error
    );
  }

  return assertPublicSitemapEntries([...staticEntries, ...educatorEntries]);
}
