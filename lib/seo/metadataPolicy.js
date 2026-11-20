const LOCALES = new Set(["en", "ar"]);

export function canonicalPath(locale, path = "/") {
  const safeLocale = LOCALES.has(locale) ? locale : "en";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const clean = normalized.split("?")[0].split("#")[0] || "/";
  return safeLocale === "ar" ? `/ar${clean === "/" ? "" : clean}` : clean;
}

export function localeAlternates(path = "/") {
  return {
    en: canonicalPath("en", path),
    ar: canonicalPath("ar", path),
  };
}
