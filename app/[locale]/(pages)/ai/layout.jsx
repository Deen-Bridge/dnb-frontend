import { siteName } from "@/lib/config/site.config";

const title = 'The AI Assistant';
const description =
  "An Islamic-knowledge assistant that scores its own confidence, verifies every Qur'an and hadith citation, and routes doubtful rulings to a scholar instead of guessing.";

export const metadata = {
  title,
  description,
  alternates: { canonical: '/ai' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/ai',
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
