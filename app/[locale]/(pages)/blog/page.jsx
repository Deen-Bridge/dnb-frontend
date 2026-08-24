"use client";
import Link from "next/link";
import Button from "@/components/atoms/form/Button";
const blogPosts = [
    {
        id: 1,
        title: "The Importance of Lifelong Learning in Islam",
        excerpt:
            "Discover how continuous learning is encouraged in Islam and how it can benefit your personal and spiritual growth.",
        date: "2025-08-05",
        author: "Deen Bridge Team",
        slug: "lifelong-learning-in-islam",
        image: "/images/mosque.png",
    },
    {
        id: 2,
        title: "How to Choose the Right Online Course for You",
        excerpt:
            "A practical guide to selecting courses that match your interests, goals, and learning style on Deen Bridge.",
        date: "2025-07-28",
        author: "Aisha Rahman",
        slug: "choose-right-online-course",
        image: "/images/mosque.png",
    },
    {
        id: 3,
        title: "Building a Supportive Learning Community",
        excerpt:
            "Learn why community matters in education and how Deen Bridge fosters a welcoming environment for all learners.",
        date: "2025-07-20",
        author: "Deen Bridge Team",
        slug: "supportive-learning-community",
        image: "/images/mosque.png",
    },
    {
        id: 4,
        title: "Maximizing Your Online Learning Experience",
        excerpt:
            "Tips and strategies to help you stay motivated, organized, and successful in your online courses.",
        date: "2025-07-10",
        author: "Fatima Yusuf",
        slug: "maximizing-online-learning",
        image: "/images/mosque.png",
    },
    {
        id: 5,
        title: "Balancing Faith and Education in a Busy World",
        excerpt:
            "Explore practical ways to integrate your spiritual growth with your academic and professional pursuits.",
        date: "2025-06-28",
        author: "Deen Bridge Team",
        slug: "balancing-faith-and-education",
        image: "/images/mosque.png",
    },
    {
        id: 6,
        title: "The Role of Mentorship in Islamic Learning",
        excerpt:
            "Understand the value of mentorship and how to find the right mentor for your learning journey.",
        date: "2025-06-15",
        author: "Imam Khalid",
        slug: "mentorship-in-islamic-learning",
        image: "/images/mosque.png",
    },
    {
        id: 7,
        title: "How to Stay Consistent with Your Studies",
        excerpt:
            "Consistency is key! Learn proven methods to maintain steady progress in your studies.",
        date: "2025-06-01",
        author: "Aisha Rahman",
        slug: "stay-consistent-with-studies",
        image: "/images/mosque.png",
    },
    {
        id: 8,
        title: "Why Community Events Matter for Learners",
        excerpt:
            "Discover the benefits of participating in community events and how they can boost your learning.",
        date: "2025-05-20",
        author: "Deen Bridge Team",
        slug: "community-events-for-learners",
        image: "/images/mosque.png",
    },
    {
        id: 9,
        title: "Tech Tools Every Modern Student Should Know",
        excerpt:
            "A roundup of essential digital tools and apps to enhance your productivity and learning.",
        date: "2025-05-10",
        author: "Fatima Yusuf",
        slug: "tech-tools-for-students",
        image: "/images/mosque.png",
    },
];

export default function BlogPage() {
    return (<>

        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-highlight opacity-20 rounded-full blur-2xl" />
        </div>
        <section className="relative z-10  mx-auto py-16 px-4">
            <h1 className="text-5xl sm:text-8xl font-extrabold text-center bg-gradient-to-r from-accent via-highlight to-accent text-transparent bg-clip-text drop-shadow-lg pb-10 font-stretch-125%">
                Deen Bridge Blog
            </h1>
            <p className="text-xl text-center text-gray-700 mb-14 font-medium">
                Insights, tips, and stories to help you grow in knowledge and faith.
            </p>
            <div className="grid gap-10 md:grid-cols-3">
                {blogPosts.map((post) => (
                    <article
                        key={post.id}
                        className="group bg-white/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-accent/10 overflow-hidden flex flex-col"
                    >
                        <div className="h-56 w-full overflow-hidden relative">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-4 left-4 bg-accent text-white text-xs px-3 py-1 rounded-full shadow font-semibold">
                                {new Date(post.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col p-6">
                            <h2 className="text-2xl font-semibold mb-2">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="hover:text-accent transition"
                                >
                                    {post.title}
                                </Link>
                            </h2>
                            <div className="text-sm text-gray-500 mb-3">
                                {post.date} &middot; {post.author}
                            </div>
                            <p className="flex-1 mb-4">{post.excerpt}</p>
                            <Button outlined round to={`/blog/${post.slug}`}>
                                Read more &rarr;
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    </>
    );
}