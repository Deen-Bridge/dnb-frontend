import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import CacheProvider from "@/components/providers/CacheProvider";
import StellarProvider from "@/components/stellar/StellarProvider";
import "../../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata = {
  title: "Deen Bridge",
  description:
    "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
  openGraph: {
    title: "Deen Bridge ",
    description:
      "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
    url: "https://deenbridge.com",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Deen Bridge - Islamic Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deen Bridge ",
    description:
      "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
    images: ["/favicon.ico"],
  },
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${arabic.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <CacheProvider>
            <StellarProvider>{children}</StellarProvider>
          </CacheProvider>
          <Toaster position={locale === "ar" ? "top-left" : "top-right"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
