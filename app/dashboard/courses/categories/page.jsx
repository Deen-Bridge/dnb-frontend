"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import {
  CATEGORY_GROUPS,
  CATEGORIES,
  getCategoryCounts,
} from "@/lib/categories";
import { BookOpen, ArrowRight, LayoutGrid } from "lucide-react";

export default function CategoryHubPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCourses();
      if (!data) throw new Error("No data returned");
      setCourses(data);
    } catch (err) {
      console.error("[CategoryHub] Failed to load courses:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Derive counts from the fetched course list
  const counts = useMemo(() => getCategoryCounts(courses), [courses]);

  const totalCourses = courses.length;

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load course categories, please try again."
        reset={loadCourses}
      />
    );
  }

  return (
    <div className="bg-muted min-h-full w-full">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-accent via-green-600 to-highlight px-6 py-10 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <LayoutGrid className="w-8 h-8 opacity-90" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Course Categories
            </h1>
          </div>
          <p className="text-green-50 text-base md:text-lg max-w-xl">
            Browse authentic Islamic knowledge across{" "}
            {CATEGORIES.length} categories grouped into{" "}
            {CATEGORY_GROUPS.length} disciplines.
          </p>
          {!loading && (
            <p className="mt-2 text-green-100 text-sm">
              {totalCourses} course{totalCourses !== 1 ? "s" : ""} available
            </p>
          )}
          <div className="mt-5">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 bg-white text-accent font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-green-50 transition-colors shadow"
            >
              <BookOpen className="w-4 h-4" />
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>

      {/* ── Loading skeletons ── */}
      {loading ? (
        <div className="p-6 max-w-6xl mx-auto space-y-10">
          {[...Array(3)].map((_, gi) => (
            <div key={gi}>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, ci) => (
                  <CourseCardSkeleton key={ci} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Category groups ── */
        <div className="p-6 max-w-6xl mx-auto space-y-10">
          {CATEGORY_GROUPS.map((group) => {
            const groupCategories = CATEGORIES.filter(
              (c) => c.group === group
            );
            return (
              <section key={group}>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">
                  {group}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {groupCategories.map((cat) => {
                    const count = counts[cat.slug] || 0;
                    const isEmpty = count === 0;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/dashboard/courses/category/${cat.slug}`}
                        className={`group flex flex-col rounded-2xl p-5 border transition-all ${
                          isEmpty
                            ? "bg-muted/40 border-border opacity-60 hover:opacity-80"
                            : "bg-background border-border hover:border-accent hover:shadow-lg hover:scale-[1.02]"
                        }`}
                        aria-label={`${cat.label} — ${count} course${count !== 1 ? "s" : ""}`}
                      >
                        {/* Icon + count */}
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className="text-3xl"
                            role="img"
                            aria-label={cat.label}
                          >
                            {cat.icon}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isEmpty
                                ? "bg-muted text-muted-foreground"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {count} course{count !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Label + description */}
                        <h3
                          className={`font-semibold text-base leading-tight mb-1 transition-colors ${
                            isEmpty
                              ? "text-muted-foreground"
                              : "text-foreground group-hover:text-accent"
                          }`}
                        >
                          {cat.label}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                          {cat.description}
                        </p>

                        {/* CTA row */}
                        <div
                          className={`mt-4 flex items-center gap-1 text-xs font-semibold ${
                            isEmpty
                              ? "text-muted-foreground"
                              : "text-accent group-hover:gap-2 transition-all"
                          }`}
                        >
                          {isEmpty ? "No courses yet" : "View courses"}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
