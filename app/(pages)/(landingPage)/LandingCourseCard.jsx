import Image from "next/image";
import Link from "next/link";
import { Star, GraduationCap } from "lucide-react";
import { getAverageRating } from "@/hooks/getAverageRating";

/**
 * A lightweight, server-renderable course card.
 * Used on the public landing page carousel where there is no auth context.
 * Avoids useAuth / useBookmark hooks so it can render reliably for visitors.
 */
export default function LandingCourseCard({ course }) {
  if (!course) return null;

  const {
    _id,
    title = "Untitled course",
    description = "",
    thumbnail,
    price,
    category,
    createdBy,
    reviews = [],
  } = course;

  const rating = getAverageRating(reviews);
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const priceLabel =
    price === 0 || price === undefined || price === null ? "Free" : `$${price}`;
  const instructorName = createdBy?.name || "DeenBridge Tutor";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-green-200/40 bg-white/90 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={thumbnail || "/images/dnb.png"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {category && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent shadow">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-accent">{title}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="size-4 text-accent" aria-hidden="true" />
            <span className="line-clamp-1 font-medium text-foreground/80">
              {instructorName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {reviewCount > 0 && (
              <span
                className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
                aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${reviewCount} reviews`}
              >
                <Star className="size-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
            )}
            <span className="rounded-full bg-gradient-to-r from-highlight to-accent px-3 py-1 text-xs font-bold text-white shadow">
              {priceLabel}
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/courses/${_id}`}
          className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Explore Course
          <span className="sr-only">: {title}</span>
        </Link>
      </div>
    </article>
  );
}
