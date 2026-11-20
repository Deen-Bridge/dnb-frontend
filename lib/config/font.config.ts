import { Poppins, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";

export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic",
});

export const poppins_400 = Poppins({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});
export const poppins_500 = Poppins({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  adjustFontFallback: false,
});
export const poppins_600 = Poppins({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  adjustFontFallback: false,
});
export const poppins_700 = Poppins({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  adjustFontFallback: false,
});

export const Inter_400 = Inter({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});
export const Inter_500 = Inter({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  adjustFontFallback: false,
});
export const Inter_600 = Inter({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  adjustFontFallback: false,
});
export const Inter_800 = Inter({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
  adjustFontFallback: false,
});
