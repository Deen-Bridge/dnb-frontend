// components/BookDetailPage.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { DownloadCloud, Eye, Star, UserRound, BarChart3 } from "lucide-react";

export default async function Page({ params }) {
    const { bookid } = params;
    const book = await getBookById(bookid);
    if (!book) return notFound();

    return (
        <div className="min-h-screen py-12 px-4 md:px-12">
            <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
                {/* Book Showcase */}
                <div className="md:col-span-8 space-y-12">
                    <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md bg-white/5">
                        <Image
                            src={book.image || "/images/placeholder.jpg"}
                            alt={book.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight">{book.title}</h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-accent ">{book.category}</Badge>
                            <Badge variant="accent" className="bg-white/10 text-highlight">
                                {book.price ? `$${book.price}` : "Free"}
                            </Badge>
                        </div>
                        <p className="text-md /80 leading-relaxed">{book.summary}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <Button
                            wide
                            className=" bg-accent hover:highlight text-white font-bold shadow-lg transition"
                            round
                            to={`/dashboard/library/read/${book.id}`}
                        >
                            Start Reading
                        </Button>
                        <Button
                            outlined
                            round
                            to={book.downloadUrl}
                            target="_blank"
                        >
                            <DownloadCloud className="w-4 h-4 mr-2" /> Download
                        </Button>
                    </div>

                    {/* Review Section */}
                    <div className="pt-10 space-y-5 border-t border-white/10">
                        <h2 className="text-3xl font-semibold">Leave a Review</h2>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="text-yellow-400 w-6 h-6 cursor-pointer hover:scale-125 transition" />
                            ))}
                        </div>
                        <Textarea
                            placeholder="What did you think about the book?"
                            className="bg-white/10  min-h-[120px] border-accent focus:outline-none"
                        />
                        <Button wide round className="bg-accent hover:bg-highlight  font-semibold mt-2 transition ">
                            Submit Review
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="md:col-span-4 space-y-8 sticky top-20 self-start">
                    {/* Author Card */}
                    <div className=" bg-accent p-6 rounded-3xl  backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-14 w-14 border border-white/10 shadow-lg">
                                <AvatarImage src={book.authorImage} />
                                <AvatarFallback>AU</AvatarFallback>
                            </Avatar>
                            <div className="text-white ">
                                <p className="font-bold ">{book.author}</p>
                                <p className="text-sm ">Author & Coach</p>
                            </div>
                        </div>
                        <p className="text-sm text-white ">{book.authorBio}</p>
                    </div>

                    {/* Book Stats */}
                    <div className="bg-accent p-6 rounded-3xl text-white  backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2 ">
                            <BarChart3 className="w-5 h-5 text-indigo-300" />
                            Book Stats
                        </h3>

                        <StatRow icon={<Eye className="w-4 h-4 text-cyan-400" />} label="Monthly Reads" value={book.monthlyReads} />
                        <StatRow
                            icon={<DownloadCloud className="w-4 h-4 text-green-400" />}
                            label="Downloads"
                            value={book.downloads}
                        />
                        <StatRow
                            icon={<Star className="w-4 h-4 text-yellow-400" />}
                            label="Rating"
                            value={`${book.rating} / 5`}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function StatRow({ icon, label, value }) {
    return (
        <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">{icon} {label}</div>
            <span className="font-bold">{value}</span>
        </div>
    );
}

// Mock Data
async function getBookById(id) {
    return {
        id,
        title: "The Power of Focus",
        summary:
            "This book guides you on how to train your mind to be focused and efficient in a world full of distractions. It offers practical strategies and techniques to enhance your concentration, manage your time effectively, and cultivate a mindset that embraces productivity.",
        category: "Productivity",
        price: 0,
        image: "/images/book1.jpg",
        downloadUrl: "/downloads/focus.pdf",
        author: "Ali Jamal",
        authorBio: "Ali Jamal is a productivity coach and writer with over 10 years of experience.",
        authorImage: "/images/img1.jpeg",
        monthlyReads: 427,
        downloads: 1200,
        rating: 4.6,
    };
}
