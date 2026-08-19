import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Resolves the active locale per request and loads its message catalog. English
// is the source of truth: any locale we don't recognise falls back to it, and
// `messages/en.json` is what missing Arabic keys resolve against, so a gap in the
// translation never crashes a page — it just renders the English string.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
