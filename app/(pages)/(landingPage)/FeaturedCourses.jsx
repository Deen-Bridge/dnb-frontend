import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getAverageRating } from "@/hooks/getAverageRating";
import FeaturedCoursesCarousel from "./FeaturedCoursesCarousel";
import LandingCourseCard from "./LandingCourseCard";

// Cache the rendered subtree for five minutes. `fetchCourses` uses axios
// (not the Next.js `fetch` API), so we can't tag the request itself with
// `next.revalidate`. Caching the component closes that gap and stops the
// landing page from hitting /api/courses on every visitor.
export const revalidate = 300;

function rankCourses(courses) {
  if (!Array.isArray(courses) || courses.length === 0) return [];

  return [...courses]
    .filter((c) => c && (c._id || c.id))
    .map((c) => {
      const enrolled = Array.isArray(c.enrolledUsers) ? c.enrolledUsers.length : 0;
      const rating = getAverageRating(c.reviews);
      const reviewCount = Array.isArray(c.reviews) ? c.reviews.length : 0;
      return { course: c, enrolled, rating, reviewCount };
    })
    .sort((a, b) => {
      if (b.enrolled !== a.enrolled) return b.enrolled - a.enrolled;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    })
    .map((entry) => entry.course);
}

/**
 * Server component. Fetches courses from /api/courses via the existing
 * axios-backed `fetchCourses()` action. Sorts by enrollment then rating and
 * surfaces the top items in a client-side embla carousel. Renders nothing
 * (graceful degradation) when the API is unreachable or returns no courses.
 */
export default async function FeaturedCourses() {
  let courses = [];
  try {
    courses = await fetchCourses();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[FeaturedCourses] fetch failed:", error?.message || error);
    courses = [];
  }

  const ranked = rankCourses(courses).slice(0, 8);

  if (ranked.length === 0) {
    // Graceful degradation — silently skip the section.
    return null;
  }

  return (
    <section
      id="featured-courses"
      aria-labelledby="featured-courses-heading"
      className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:py-20"
    >
      <header className="mb-10 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="flex flex-col items-center sm:items-start">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/10 dark:text-green-300">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Featured Courses
          </span>
          <h2
            id="featured-courses-heading"
            className="bg-gradient-to-r from-accent via-green-500 to-highlight bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl"
          >
            Learn from the Community
          </h2>
          <p className="mt-2 max-w-xl text-base text-muted-foreground sm:text-lg">
            Hand-picked courses from our most engaged educators and learners.
          </p>
        </div>

        <Link
          href="/dashboard/courses"
          className="mt-4 inline-flex items-center gap-1.5 self-end rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:mt-0"
        >
          Browse all courses
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <FeaturedCoursesCarousel>
        {ranked.map((course) => (
          <LandingCourseCard key={course._id || course.id} course={course} />
        ))}
      </FeaturedCoursesCarousel>
    </section>
  );
}
