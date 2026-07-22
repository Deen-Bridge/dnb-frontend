"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSwitcher({ className = "" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("localeSwitcher");

  function switchLocale() {
    router.replace(pathname, { locale: locale === "en" ? "ar" : "en" });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={`rounded-md border border-current/30 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10 ${className}`}
      aria-label={t("label")}
    >
      {locale === "en" ? "العربية" : "EN"}
    </button>
  );
}
