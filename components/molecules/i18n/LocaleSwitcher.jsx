"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS = {
  en: "EN",
  ar: "العربية",
};

/**
 * EN / العربية switcher. Uses next-intl navigation so the *current route* is
 * preserved when the locale changes (not a jump back to home), and the choice
 * persists across reloads via the locale cookie the middleware sets on
 * navigation. Rendered in both the landing navbar and the dashboard header.
 *
 * `tone="inverse"` styles it for the dark hero navbar; the default suits the
 * light/dark dashboard surfaces.
 */
export default function LocaleSwitcher({ tone = "default", className }) {
  const t = useTranslations("common");
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelect = (nextLocale) => {
    if (nextLocale === activeLocale) return;
    startTransition(() => {
      // `pathname` from next-intl is the current route without the locale prefix
      // and with dynamic segments already resolved, so replaying it under a new
      // locale keeps the user exactly where they are (not a jump back to home).
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const inverse = tone === "inverse";

  return (
    <div
      role="group"
      aria-label={t("languageSwitcherLabel")}
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-medium",
        inverse
          ? "border-ink-inverse/25 bg-basic/30 backdrop-blur"
          : "border-border bg-muted",
        isPending && "opacity-60",
        className
      )}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={isActive ? "true" : undefined}
            disabled={isPending}
            onClick={() => onSelect(locale)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              isActive
                ? "bg-accent text-white"
                : inverse
                  ? "text-ink-inverse/80 hover:text-ink-inverse"
                  : "text-ink-muted hover:text-ink"
            )}
          >
            {LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
