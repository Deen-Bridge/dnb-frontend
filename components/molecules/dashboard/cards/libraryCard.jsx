import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { Star } from "lucide-react"; // optional: use a custom star icon or emoji
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getAverageRating } from "@/hooks/getAverageRating";
import useBookBookmark from "@/hooks/useBookBookmark";
import BookmarkButton from "@/components/atoms/BookmarkButton";
import { VerifiedBadge } from "@/components/atoms/VerifiedBadge";

const LibraryBookCard = ({ book, onBookmarkChange, initialIsBookmarked }) => {
  const { isBookmarked, loading, toggle } = useBookBookmark(
    book._id,
    onBookmarkChange,
    initialIsBookmarked
  );

  const handleBookmark = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await toggle();
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-md w-full max-w-md mx-auto">
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
            <span className="bg-white/20 px-2 py-0.5 rounded">
              {book.category || "General"}
            </span>
            <span className="font-medium">
              {book.price > 0 ? `$${book.price}` : "Free"}
            </span>
          </div>
        </div>
      </div>
      {/* Author, Reads, Rating */}
      <div className="px-4 py-4 flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Author */}
          <Link
            href={`/educators/${book.author?._id}`}
            className="flex items-center gap-2"
          >
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={book.author?.avatar || "/images/img1.jpeg"} alt="" />
              <AvatarFallback>
                {book.author?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col pt-2">
              <span className="font-medium text-foreground">
                {book.author?.name || "Unknown Author"}
                {book.author?.isVerified && (
                  <VerifiedBadge user={book.author} showLabel={false} />
                )}
              </span>
              <span className="text-sm">
                {book.author?.role || "Unknown Author"}
              </span>
            </div>
          </Link>
          {/* Bookmark button */}
          <BookmarkButton
            isBookmarked={isBookmarked}
            loading={loading}
            onClick={handleBookmark}
            variant="book"
          />
        </div>
        {/* Reads & Rating */}
        <div className="flex justify-between items-center text-xs">
          <span>{book.readCount || 0} readers</span>
          <div className="flex items-center gap-0.5 text-yellow-500">
            <span className="sr-only">
              Rated {Math.round(getAverageRating(book?.reviews) || 0)} out of 5
            </span>
            {[...Array(5)].map((_, i) => (
              <Star
                key={`${book._id}-star-${i}`}
                size={14}
                fill={
                  i < Math.round(getAverageRating(book?.reviews) || 0)
                    ? "#FFD700"
                    : "none"
                }
                stroke="#FFD700"
                aria-hidden="true"
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
