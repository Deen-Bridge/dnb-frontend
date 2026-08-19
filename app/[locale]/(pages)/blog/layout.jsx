import Navbar from "@/components/molecules/ladingpage/Navbar";

export const metadata = {
    title: "Deen Bridge Blog | Islamic Learning, Qur'an, Arabic, Fiqh & More",
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
        url: "https://deenbridge.com/blog",
        type: "website",
        images: [
            {
                url: "/favicon.ico",
                width: 1200,
                height: 630,
                alt: "Deen Bridge - Islamic Learning Platform",
            },
        ],
        site_name: "Deen Bridge Blog",
    },
    twitter: {
        card: "summary_large_image",
        title: "Deen Bridge Blog | Islamic Learning, Qur'an, Arabic, Fiqh & More",
        description:
            "Explore the Deen Bridge Blog for authentic Islamic knowledge, tips, and stories. Learn Qur'an, Arabic, Fiqh, and more through expert articles and community insights.",
        images: ["/favicon.ico"],
        site: "@deenbridge",
        creator: "@deenbridge"
    },
    authors: [{ name: "Deen Bridge Team", url: "https://deenbridge.com/about" }],
    creator: "Deen Bridge Team",
    publisher: "Deen Bridge",
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