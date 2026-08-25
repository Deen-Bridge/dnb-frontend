import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { Star } from "lucide-react";
import { getAverageRating } from "@/hooks/getAverageRating";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const PublicBookCard = ({ book }) => {
  const avgRating = getAverageRating(book?.reviews);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={book.image || "/images/placeholder.jpg"}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4 text-white">
          <h4 className={cn(poppins_600, "truncate text-sm")}>{book.title}</h4>
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                poppins_500,
                "rounded-full bg-white/20 px-2 py-0.5 backdrop-blur"
              )}
            >
              {book.category || "General"}
            </span>
            <span className={poppins_600}>
              {book.price > 0 ? `$${book.price}` : "Free"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <span className={cn(poppins_400, "text-xs text-ink-muted")}>
          {book.readCount || 0} readers
        </span>
        {avgRating > 0 && (
          <div className="flex items-center gap-0.5">
            <span className="sr-only">Rated {avgRating} out of 5</span>
            {[...Array(5)].map((_, i) => (
              <Star
                key={`${book._id}-star-${i}`}
                size={14}
                className={
                  i < Math.round(avgRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-ink-muted/40"
                }
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <Button
          to={`/dashboard/library/${book._id}`}
          wide
          round
          className={cn(
            poppins_500,
            "w-full bg-accent text-sm text-white hover:bg-highlight"
          )}
        >
          View Book
        </Button>
      </div>
    </div>
  );
};

export default PublicBookCard;
