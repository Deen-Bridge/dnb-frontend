import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getAverageRating } from "@/hooks/getAverageRating";
import { resolveCategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const PublicCourseCard = ({ course }) => {
  const avgRating = getAverageRating(course?.reviews);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={course.thumbnail || "/images/dnb.png"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Link
          href={`/dashboard/courses/category/${resolveCategorySlug(
            course?.category
          )}`}
          className={cn(
            poppins_600,
            "absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-wider text-accent shadow"
          )}
        >
          {course.category || "General"}
        </Link>
        <span
          className={cn(
            poppins_600,
            "absolute bottom-3 right-3 rounded-full bg-gradient-to-r from-secondary to-highlight px-3 py-1 text-xs text-white shadow"
          )}
        >
          {course.price ? `$${course.price}` : "Free"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className={cn(poppins_600, "line-clamp-1 text-base text-ink")}>
          {course.title}
        </h3>
        <p
          className={cn(
            poppins_400,
            "mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted"
          )}
        >
          {course.description}
        </p>

        <div className="mt-3">
          {avgRating > 0 ? (
            <span className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className={cn(poppins_500, "text-ink")}>
                {avgRating.toFixed(1)}
              </span>
            </span>
          ) : (
            <span className={cn(poppins_400, "text-xs text-ink-muted")}>
              New course
            </span>
          )}
        </div>

        <Button
          wide
          round
          className={cn(
            poppins_500,
            "mt-4 w-full bg-accent text-sm text-white hover:bg-highlight"
          )}
          to={`/dashboard/courses/${course._id}`}
        >
          View Course
        </Button>
      </div>
    </div>
  );
};

export default PublicCourseCard;
