import Navbar from "@/components/molecules/ladingpage/Navbar";
import { siteUrl, siteName } from "@/lib/config/site.config";

export const metadata = {
    title: { absolute: "Deen Bridge Blog | Islamic Learning, Qur'an, Arabic, Fiqh & More" },
    description:
        "Explore the Deen Bridge Blog for authentic Islamic knowledge, tips, and stories. Learn Qur'an, Arabic, Fiqh, and more through expert articles and community insights.",
    keywords: [
        "Islamic blog",
        "Qur'an learning",
        "Arabic courses",
        "Fiqh articles",
        "Islamic mentorship",
        "Muslim education",
        "Deen Bridge",
        "Online Islamic learning",
        "Islamic resources",
        "Islamic community"
    ],
    openGraph: {
        title: "Deen Bridge Blog | Islamic Learning, Qur'an, Arabic, Fiqh & More",
        description:
            "Explore the Deen Bridge Blog for authentic Islamic knowledge, tips, and stories. Learn Qur'an, Arabic, Fiqh, and more through expert articles and community insights.",
        url: `${siteUrl}/blog`,
        type: "website",
        images: [
            {
                url: "/og.png",
                width: 1200,
                height: 630,
                alt: "Deen Bridge - Islamic Learning Platform",
            },
        ],
        site_name: siteName,
    },
    twitter: {
        card: "summary_large_image",
        title: "Deen Bridge Blog | Islamic Learning, Qur'an, Arabic, Fiqh & More",
        description:
            "Explore the Deen Bridge Blog for authentic Islamic knowledge, tips, and stories. Learn Qur'an, Arabic, Fiqh, and more through expert articles and community insights.",
        images: ["/og.png"],
        site: "@deen_bridge",
        creator: "@deen_bridge"
    },
    authors: [{ name: "Deen Bridge Team", url: `${siteUrl}/about` }],
    creator: "Deen Bridge Team",
    publisher: siteName,
    robots: "index, follow",
};

export default function Layout({ children }) {
    return (
        <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-24">
            <section className="bg-basic py-5">
                <Navbar />
            </section>
            {children}
        </section>
    );
}