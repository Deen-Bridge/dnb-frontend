import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAverageRating } from "@/hooks/getAverageRating";

/**
 * Lightweight course card for unauthenticated landing-page visitors.
 * Does NOT import useAuth or bookmark hooks — safe for server-rendered pages.
 */
export default function PublicCourseCard({ course }) {
  const rating = getAverageRating(course.reviews ?? []);
  const reviewCount = course.reviews?.length ?? 0;
  const instructorName = course.createdBy?.name ?? "Instructor";
  const instructorAvatar = course.createdBy?.avatar ?? "/images/placeholder.jpg";
  const initials = instructorName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link
      href={`/dashboard/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 h-full"
      tabIndex={0}
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={course.thumbnail ?? "/images/dnb.png"}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-white/85 text-accent font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
            {course.category ?? "General"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-bold text-base line-clamp-2 text-gray-900 leading-snug">
          {course.title}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Instructor */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage src={instructorAvatar} alt={instructorName} />
            <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{instructorName}</p>
            <p className="text-xs text-muted-foreground">Instructor</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {course.price ? `$${course.price} USDC` : "Free"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
