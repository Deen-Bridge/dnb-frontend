"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderX } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import { fetchCoursesByCategory } from "@/lib/actions/courses/fetch-course-categories";
import { useAllCourseProgress } from "@/hooks/useCourseProgress";
import { getCategoryBySlug, FALLBACK_SLUG } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const SkeletonGrid = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, idx) => (
      <CourseCardSkeleton key={`skeleton-${idx}`} />
    ))}
  </div>
);

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

const CategoryPageContent = () => {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { progressMap } = useAllCourseProgress();

  const category = getCategoryBySlug(slug);

  useEffect(() => {
    let cancelled = false;
    setCourses([]);
    setLoading(true);
    setError(false);
    fetchCoursesByCategory(slug, sort)
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, sort]);

  useEffect(() => {
    router.replace(
      sort !== "newest"
        ? `?sort=${sort}`
        : "/dashboard/courses/category/" + slug,
      { scroll: false }
    );
  }, [sort, slug, router]);

  if (!category) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center bg-surface p-4">
        <div className="flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-2xl border border-accent/10 bg-surface-raised px-6 py-16 text-center shadow-sm">
          <div
            className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10"
            aria-hidden="true"
          >
            <FolderX className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "text-lg text-ink"
              )}
            >
              Category not found
            </h1>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              This category doesn&apos;t exist or may have been renamed.
            </p>
          </div>
          <Link
            href="/dashboard/courses/categories"
            className={cn(
              poppins_500,
              "rounded-full bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
            )}
          >
            Browse all categories
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;
  const title = category.shortLabel || category.label;
  const isFallback = slug === FALLBACK_SLUG;
  const emptyHeading = isFallback
    ? "No uncategorized courses yet."
    : `No courses yet in ${title}`;

  return (
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10"
            aria-hidden="true"
          >
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
              )}
            >
              {title}
            </h1>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              poppins_500,
              "rounded-full border border-accent/15 bg-surface-raised px-3 py-1 text-xs"
            )}
          >
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </span>
          <select
            aria-label="Sort courses"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-accent/20 bg-surface-raised px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <NetworkErrorComp
          errMsg="Failed to load courses in this category."
          reset={() => {
            setLoading(true);
            setError(false);
            fetchCoursesByCategory(slug, sort)
              .then(setCourses)
              .catch(() => setError(true))
              .finally(() => setLoading(false));
          }}
        />
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10"
              aria-hidden="true"
            >
              <Icon className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className={cn(poppins_600, "text-lg text-ink")}>
                {emptyHeading}
              </h3>
              <p
                className={cn(
                  poppins_400,
                  "mt-1 max-w-md text-sm text-ink-muted"
                )}
              >
                Be the first to teach in this category and share your knowledge.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={cn(
                poppins_500,
                "rounded-full bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
              )}
            >
              Create first course
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              progress={progressMap[course._id]}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          fetchCoursesByCategory(slug, sort)
            .then(setCourses)
            .catch(() => {});
        }}
        title="Create Course"
        className="max-w-md w-full"
      >
        <CreateCourseForm />
      </Modal>
    </div>
  );
};

const CategoryPage = () => (
  <Suspense
    fallback={
      <div className="bg-surface p-4 sm:p-6">
        <SkeletonGrid />
      </div>
    }
  >
    <CategoryPageContent />
  </Suspense>
);

export default CategoryPage;