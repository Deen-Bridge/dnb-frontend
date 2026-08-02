import { siteName } from "@/lib/config/site.config";

const title = 'Payments on Stellar';
const description =
  'How Deen Bridge pays educators in USDC, funds sadaqah on-chain, and settles course and book purchases in seconds — non-custodial, on the Stellar network.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/stellar' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/stellar',
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
