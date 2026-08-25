import { siteName } from "@/lib/config/site.config";

const title = 'About Us';
const description =
  'Why we built Deen Bridge — a digital home for the Ummah, bridging authentic Islamic knowledge and modern community, built in the open.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/about',
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
