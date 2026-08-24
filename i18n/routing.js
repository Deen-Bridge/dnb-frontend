import { defineRouting } from "next-intl/routing";

// Locale routing config shared by the middleware, the request pipeline, and the
// typed navigation helpers. `ar` is right-to-left; the `[locale]` layout maps it
// to `dir="rtl"`. `defaultLocale` stays unprefixed (`localePrefix: "as-needed"`)
// so `/` keeps serving English exactly as before while `/ar` opts into Arabic.
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
