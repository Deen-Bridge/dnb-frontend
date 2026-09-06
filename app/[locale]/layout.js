import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import AppProviders from "@/components/providers/AppProviders";
import { appearanceInitScript } from "@/lib/config/appearance.config";
import { ibmPlexArabic } from "@/lib/config/font.config";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import "../../styles/globals.css";
import {
  siteUrl,
  siteName,
  siteDescription,
  isProduction,
} from "@/lib/config/site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pre-render both locales at build time instead of on first request.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const isArabic = locale === "ar";

  return {
    // Without metadataBase every relative OG/Twitter image resolved against
    // localhost, so social cards and Google fetched a URL that does not exist.
    metadataBase: new URL(siteUrl),
    title: {
      default: t("defaultTitle"),
      // Child pages set only their own title; this appends the brand.
      template: `%s | ${siteName}`,
    },
    description: t("description"),
    applicationName: siteName,
    keywords: [
      "Islamic education",
      "Qur'an courses",
      "Islamic books",
      "hadith",
      "fiqh",
      "tafsir",
      "Arabic learning",
      "Muslim community",
      "Islamic AI assistant",
      "halal payments",
      "Stellar USDC",
    ],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: isArabic ? "/ar" : "/",
      languages: {
        en: "/",
        ar: "/ar",
      },
    },
    robots: isProduction
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
    verification: {
      // Google Search Console site verification.
      google: "5wgXR8dgVCB1WtRPLGaDkl02FzFdWAvjBao3VjiLqjY",
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }],
    },
    appleWebApp: {
      capable: true,
      title: "DeenBridge",
      statusBarStyle: "black-translucent",
    },
    openGraph: {
      title: t("defaultTitle"),
      description: t("description"),
      url: isArabic ? `${siteUrl}/ar` : siteUrl,
      siteName,
      locale: isArabic ? "ar_AR" : "en_US",
      type: "website",
      images: [
        {
          // Was /favicon.ico declared as 1200x630 — a real image now exists.
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Deen Bridge — authentic Islamic education, together.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@deen_bridge",
      creator: "@deen_bridge",
      title: t("defaultTitle"),
      description: t("description"),
      images: ["/og.png"],
    },
    category: "education",
  };
}

export const viewport = {
  themeColor: "#092601",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Structured data: lets Google associate the brand, logo, and social profiles,
// and offer a sitelinks search box.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/icons/icon-512x512.png`,
      description: siteDescription,
      sameAs: ["https://github.com/Deen-Bridge", "https://x.com/deen_bridge"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: ["en", "ar"],
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#school`,
      name: siteName,
      url: siteUrl,
      description:
        "Online Islamic education — courses, a curated library, and live community spaces taught by verified educators.",
    },
  ],
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  // Guard against unknown locales reaching the layout (e.g. a hand-typed URL).
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Opt every page under this layout into static rendering for the locale.
  setRequestLocale(locale);

  const isArabic = locale === "ar";
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript() }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexArabic.variable} antialiased${
          isArabic ? " font-arabic" : ""
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
        <Toaster position={isArabic ? "top-left" : "top-right"} />
      </body>
    </html>
  );
}
