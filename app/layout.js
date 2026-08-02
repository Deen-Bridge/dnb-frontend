import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import AppProviders from "@/components/providers/AppProviders";
import { appearanceInitScript } from "@/lib/config/appearance.config";
import "../styles/globals.css";
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

export const metadata = {
  // Without metadataBase every relative OG/Twitter image resolved against
  // localhost, so social cards and Google fetched a URL that does not exist.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Deen Bridge — Authentic Islamic Education",
    // Child pages set only their own title; this appends the brand.
    template: "%s | Deen Bridge",
  },
  description: siteDescription,
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
    canonical: "/",
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
    title: "Deen Bridge — Authentic Islamic Education",
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
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
    title: "Deen Bridge — Authentic Islamic Education",
    description: siteDescription,
    images: ["/og.png"],
  },
  category: "education",
};

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
      sameAs: [
        "https://github.com/Deen-Bridge",
        "https://x.com/deen_bridge",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: appearanceInitScript() }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
