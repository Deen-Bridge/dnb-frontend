import Navbar from "@/components/molecules/ladingpage/Navbar";


export const metadata = {
    title: "Deen Bridge Blog",
    description:
        "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
    openGraph: {
        title: "Deen Bridge Blog",
        description:
            "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
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
    },
    twitter: {
        card: "summary_large_image",
        title: "Deen Bridge ",
        description:
            "Empowering Muslims with authentic knowledge — Learn Qur'an, Arabic, Fiqh, and more through 1-on-1 live mentorship and lots more.",
        images: ["/favicon.ico"],
    },
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