import Image from "next/image";
import Link from "next/link";
import { Star, Quote } from "lucide-react";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";

// Cache the rendered subtree for five minutes (see FeaturedCourses for
// the rationale — axios calls can't carry `next.revalidate` themselves).
export const revalidate = 300;

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function extractRealReviews(courses) {
  if (!Array.isArray(courses)) return [];
  const reviews = [];
  for (const course of courses) {
    if (!course || !Array.isArray(course.reviews)) continue;
    for (const review of course.reviews) {
      if (!review) continue;
      const comment = (review.comment || "").trim();
      const userName = review.user?.name?.trim();
      // Skip entries without both an attributable user and a meaningful comment
      if (!comment || !userName) continue;
      reviews.push({
        id: review._id || `${course._id}-${reviews.length}`,
        name: userName,
        avatar: review.user?.avatar,
        rating: typeof review.rating === "number" ? review.rating : 0,
        quote: comment,
        course: {
          _id: course._id,
          title: course.title || "this course",
        },
      });
    }
  }
  return reviews;
}

/**
 * Server component. Builds a real, attributable testimonials section from
 * actual student reviews attached to courses. If the API is unreachable or
 * no real reviews exist yet, renders nothing (graceful degradation —
 * acceptance criteria for issue #114 explicitly forbid fabricating quotes).
 */
export default async function Testimonials() {
  let courses = [];
  try {
    courses = await fetchCourses();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Testimonials] fetch failed:", error?.message || error);
    courses = [];
  }

  const reviews = extractRealReviews(courses).slice(0, 6);
  if (reviews.length === 0) {
    // Nothing real to show — silently skip the section.
    return null;
  }

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative bg-basic py-20 px-2 sm:px-6 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute left-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-highlight/10 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            From Our Students
          </span>
          <h2
            id="testimonials-heading"
            className="bg-gradient-to-r from-accent via-green-400 to-highlight bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl"
          >
            What Our Community Says
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Real reviews left by learners on courses across Deen Bridge.
          </p>
        </header>

        <ul
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {reviews.map((t) => {
            const safeRating = Math.max(0, Math.min(5, Math.round(t.rating || 0)));
            return (
              <li key={t.id}>
                <article className="flex h-full flex-col rounded-3xl bg-white/85 p-8 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-white/10">
                  <Quote
                    className="mb-3 size-8 text-accent"
                    aria-hidden="true"
                  />
                  <blockquote className="flex-1 text-base italic leading-relaxed text-foreground/90 dark:text-white/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="mt-4 flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`${t.id}-star-${i}`}
                        className="size-4"
                        fill={i < safeRating ? "#FFD700" : "none"}
                        stroke="#FFD700"
                        aria-hidden="true"
                      />
                    ))}
                    <span className="sr-only">{`Rated ${safeRating} out of 5`}</span>
                  </div>

                  <footer className="mt-5 flex items-center gap-4">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={`${t.name}'s avatar`}
                        width={44}
                        height={44}
                        className="size-11 rounded-full object-cover ring-2 ring-white/30"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-highlight text-sm font-bold text-white"
                      >
                        {getInitials(t.name) || "U"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-accent">
                        {t.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Student
                        {" — "}
                        <Link
                          href={`/dashboard/courses/${t.course._id}`}
                          className="underline-offset-2 hover:underline"
                        >
                          {t.course.title}
                        </Link>
                      </span>
                    </div>
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
