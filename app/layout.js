import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "Deen Bridge ",
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


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
     
        {children}
        <Toaster  position="top-right"/>
      </body>
    </html>
  );
}
