import { siteName } from "@/lib/config/site.config";

const title = 'Features';
const description =
  'Courses, a curated Islamic library, live community spaces, an AI assistant, transparent sadaqah, and USDC payments on Stellar.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/features' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/features',
    siteName,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: ["/og.png"],
  },
};

export default function Layout({ children }) {
  return children;
}
