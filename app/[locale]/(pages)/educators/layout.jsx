import { siteName } from "@/lib/config/site.config";

const title = 'Our Educators';
const description =
  'Meet the teachers, authors, and hosts who write the books, build the courses, and lead the live spaces on Deen Bridge.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/educators' },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: '/educators',
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
