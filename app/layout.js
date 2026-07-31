import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import StellarProvider from "@/components/stellar/StellarProvider";
import { appearanceInitScript } from "@/lib/config/appearance.config";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Deen Bridge",
  description:
    "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
  manifest: "/manifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "DeenBridge",
    statusBarStyle: "black-translucent",
  },
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: appearanceInitScript() }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<<<<<<< HEAD
        <ThemeProvider>
          <AppearanceProvider>
            <CacheProvider>
              <AuthProvider>
                <StellarProvider>{children}</StellarProvider>
              </AuthProvider>
            </CacheProvider>
            <Toaster position="top-right" />
          </AppearanceProvider>
        </ThemeProvider>
>>>>>>> origin/dev
      </body>
    </html>
  );
}
