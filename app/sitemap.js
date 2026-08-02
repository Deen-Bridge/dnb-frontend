import { siteUrl, publicRoutes } from "@/lib/config/site.config";

export default function sitemap() {
  const lastModified = new Date();

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
