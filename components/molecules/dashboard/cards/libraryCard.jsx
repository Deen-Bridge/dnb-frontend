import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { Star } from "lucide-react"; // optional: use a custom star icon or emoji
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
const LibraryBookCard = ({ book }) => {
    console.log("LibraryBookCard user id ", book.author?._id);
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md w-full max-w-md mx-auto">

            {/* Image with overlay */}
            <div className="relative w-full h-64">
                <Image
                    src={book.image || "/images/placeholder.jpg"}
                    alt={book.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white px-4 py-3 space-y-1">
                    <h4 className="text-sm font-semibold truncate">{book.title}</h4>
                    <div className="flex justify-between items-center text-xs">
                        <span className="bg-white/20 px-2 py-0.5 rounded">{book.category || "General"}</span>
                        <span className="font-medium">
                            {book.price > 0 ? `$${book.price}` : "Free"}
                        </span>
                    </div>
                </div>
            </div>
            {/* Author, Reads, Rating */}
            <div className="px-4 py-4 flex flex-col gap-3 text-sm text-muted-foreground">
                {/* Author */}
                <div className="flex items-center gap-2">
                    <Link href={`/account/profile/${book.author?._id}`} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={book.author?.avatar || "/images/img1.jpeg"} />
                        <AvatarFallback>{book.author?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-black">{book.author?.name || "Unknown Author"}</span>
                   </Link>
                   </div>

                {/* Reads & Rating */}
                <div className="flex justify-between items-center text-xs">
                    <span>{book.readCount || 0} readers</span>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                fill={i < Math.round(book.rating || 0) ? "#facc15" : "none"}
                                stroke="#facc15"
                            />
                        ))}
                    </div>
                </div>
            </div>
            {/* Button */}
            <div className="px-4 py-3">
                <Button
                    to={`/dashboard/library/${book._id}`}
                    wide
                    round
                    className="w-full bg-accent text-white"
                >
                    View Book
                </Button>
            </div>


        </div>
    );
};

export default LibraryBookCard;
