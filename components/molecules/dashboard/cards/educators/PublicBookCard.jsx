import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { Star } from "lucide-react";
import { getAverageRating } from "@/hooks/getAverageRating";

const PublicBookCard = ({ book }) => {
  const avgRating = getAverageRating(book?.reviews);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md w-full max-w-md mx-auto">
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

      <div className="px-4 py-4 flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between text-xs">
          <span>{book.readCount || 0} readers</span>
          {avgRating > 0 && (
            <div className="flex items-center gap-0.5 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`${book._id}-star-${i}`}
                  size={14}
                  fill={i < Math.round(avgRating) ? "#FFD700" : "none"}
                  stroke="#FFD700"
                />
              ))}
            </div>
          )}
        </div>
      </div>

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

export default PublicBookCard;
