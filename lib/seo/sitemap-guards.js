export const protectedSitemapPrefixes = [
  "/dashboard/",
  "/admin/",
  "/account/",
  "/api/",
  "/verify-email",
  "/profile-setup",
  "/offline",
];

export function assertPublicSitemapEntries(entries) {
  const privateEntries = entries.filter(({ url }) => {
    try {
      const pathname = new URL(url).pathname;
      return protectedSitemapPrefixes.some((prefix) => pathname.includes(prefix));
    } catch {
      return true;
    }
  });

  if (privateEntries.length > 0) {
    throw new Error(`Protected route entered sitemap: ${privateEntries.map(({ url }) => url).join(", ")}`);
  }

  return entries;
}
