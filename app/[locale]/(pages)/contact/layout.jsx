import { siteName } from "@/lib/config/site.config";

const title = 'Contact';
const description =
  'Questions, feedback, partnerships, or applying to teach — get in touch with the Deen Bridge team.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/contact',
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
