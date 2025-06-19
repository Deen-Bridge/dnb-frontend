import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { Star } from "lucide-react"; // optional: use a custom star icon or emoji
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getAverageRating } from "@/hooks/getAverageRating";
import RecommendedCourseCard from "./R-CourseCard";


const RecommendedBookCard = ({ book }) => {
    console.log("RecommendedBookCard user id ", book.author?._id);
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md w-full">

            {/* Image with overlay */}
            <div className="relative w-full h-64">
                <Image
                    src={book.image || "/images/placeholder.jpg"}
                    alt="books"
                    fill
                    className="object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white px-4 py-3 space-y-1">
                    <h4 className="text-sm font-semibold truncate font-stretch-125%">{book.title}</h4>
                    <div className="flex justify-between items-center text-xs">
                        <span className="bg-white/20 px-2 py-0.5 rounded">{book.category || "General"}</span>
                        <span className="font-medium">
                            {book.price > 0 ? `$${book.price}` : "Free"}
                        </span>
                    </div>
                </div>
            </div>
            {/* Author, Reads, Rating */}
            <div className="px-4 py-4 flex justify-between items-center  gap-2 text-sm text-muted-foreground">
                {/* Author */}
                <Link href="" className="flex items-center ju gap-2">
                    <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={book.author?.avatar || "/images/img-2.jpeg"} />
                        <AvatarFallback>{book.author?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col  pt-2">
                        <span className="font-sans text-md text-black">{book.instructor|| "Unknown Author"}</span>
                    </div>
                </Link>
                {/* Reads & Rating */}
                <div className="flex flex-col justify-between items-start text-xs">
                    <div className="flex items-center gap-0.5 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                fill={i < (book?.rating || 0) ? "#FFD700" : "none"}
                                stroke="#FFD700"
                            />
                        ))}
                    </div>
                    <span>{book.readCount || 0} monthly-reads</span>
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

export default RecommendedBookCard;
