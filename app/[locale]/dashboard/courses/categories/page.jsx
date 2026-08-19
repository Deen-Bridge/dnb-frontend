"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { fetchCourseCategories } from "@/lib/actions/courses/fetch-course-categories";
import {
  CATEGORY_GROUPS,
  FALLBACK_CATEGORY,
  FALLBACK_SLUG,
} from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const CategoryGridSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, idx) => (
      <Skeleton
        key={`category-skeleton-${idx}`}
        className="h-24 w-full rounded-2xl"
      />
    ))}
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <Skeleton className="size-11 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-52 rounded-md" />
        <Skeleton className="h-4 w-44 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-9 w-40 rounded-full" />
  </div>
);

export default function CategoriesHubPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCourseCategories()
      .then(setCategories)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    setLoading(true);
    setError(false);
    fetchCourseCategories()
      .then(setCategories)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load categories, try again later"
        reset={reload}
      />
    );
  }

  const countBySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category.count])
  );
  const otherCount = countBySlug[FALLBACK_SLUG] || 0;

  return (
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
              <LayoutGrid className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
                )}
              >
                Course Categories
              </h1>
              <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                Browse courses by subject
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/courses"
            className={cn(
              poppins_500,
              "inline-flex items-center gap-1.5 rounded-full border border-accent/10 bg-surface-raised px-4 py-2 text-sm text-accent shadow-sm transition-colors hover:border-accent/30 hover:bg-accent hover:text-white"
            )}
          >
            Browse all courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>
      )}

      {loading ? (
        <CategoryGridSkeleton />
      ) : (
        <>
          {CATEGORY_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section
                key={group.id}
                id={group.id}
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-accent/10 bg-surface-raised">
                    <GroupIcon
                      className="h-5 w-5 text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className={cn(poppins_600, "text-lg text-ink")}>
                      {group.label}
                    </h2>
                    <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                      {group.description}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {group.categories.map((category) => {
                    const count = countBySlug[category.slug] || 0;
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.slug}
                        href={`/dashboard/courses/category/${category.slug}`}
                        className={cn(
                          "group rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-colors hover:border-accent/40",
                          count === 0 && "border-dashed opacity-60"
                        )}
                      >
                        <div className="flex h-full flex-col gap-3 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                              <Icon
                                className="h-6 w-6 text-accent"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="rounded-full border border-accent/10 bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
                              {count} course{count === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div>
                            <h3 className={cn(poppins_500, "text-sm text-ink")}>
                              {category.shortLabel}
                            </h3>
                            <p
                              className={cn(
                                poppins_400,
                                "mt-1 line-clamp-2 text-xs text-ink-muted"
                              )}
                            >
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {otherCount > 0 && (
            <section
              id="other-categories"
              className="scroll-mt-24 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-accent/10 bg-surface-raised">
                  <FALLBACK_CATEGORY.icon
                    className="h-5 w-5 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h2 className={cn(poppins_600, "text-lg text-ink")}>
                    Other Categories
                  </h2>
                  <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                    Courses that don&apos;t fit a standard subject
                  </p>
                </div>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href={`/dashboard/courses/category/${FALLBACK_SLUG}`}
                  className="group rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-colors hover:border-accent/40"
                >
                  <div className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                        <FALLBACK_CATEGORY.icon
                          className="h-6 w-6 text-accent"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="rounded-full border border-accent/10 bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
                        {otherCount} course{otherCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div>
                      <h3 className={cn(poppins_500, "text-sm text-ink")}>
                        {FALLBACK_CATEGORY.label}
                      </h3>
                      <p
                        className={cn(
                          poppins_400,
                          "mt-1 line-clamp-2 text-xs text-ink-muted"
                        )}
                      >
                        {FALLBACK_CATEGORY.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}