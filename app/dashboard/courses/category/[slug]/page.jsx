"use client";
import { useEffect, useState, useMemo } from "react";
import { use } from "react";
import Link from "next/link";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import NotFoundComp from "@/components/molecules/errors/NotFound";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import { getCategoryBySlug, resolveSlug } from "@/lib/categories";
import { getAverageRating } from "@/hooks/getAverageRating";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function sortCourses(courses, sort) {
  const sorted = [...courses];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "rating":
      return sorted.sort(
        (a, b) =>
          getAverageRating(b.reviews || []) -
          getAverageRating(a.reviews || [])
      );
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
  }
}

export default function CategoryLandingPage({ params }) {
  // Unwrap params using React.use() for Next.js 15+
  const { slug } = use(params);

  const category = getCategoryBySlug(slug);

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCourses();
      setAllCourses(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [slug]);

  // Filter to this category's courses
  const categoryCourses = useMemo(
    () =>
      sortCourses(
        allCourses.filter((c) => resolveSlug(c.category) === slug),
        sort
      ),
    [allCourses, slug, sort]
  );

  // Unknown slug → graceful not-found, no crash
  if (!category) {
    return (
      <NotFoundComp
        errMsg={`No category found for "${slug}". It may have been renamed or doesn't exist yet.`}
      />
    );
  }

  if (error) {
    return (
      <NetworkErrorComp
        errMsg={`Failed to load courses for ${category.label}. Please try again.`}
        reset={loadCourses}
      />
    );
  }

  return (
    <>
      <div className="bg-muted min-h-full w-full">
        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-accent via-green-600 to-highlight px-6 py-10 text-white">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-green-100 text-sm mb-4">
              <Link
                href="/dashboard/courses"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Courses
              </Link>
              <span>/</span>
              <Link
                href="/dashboard/courses/categories"
                className="hover:text-white transition-colors"
              >
                Categories
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{category.label}</span>
            </nav>

            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <span className="text-5xl" role="img" aria-label={category.label}>
                {category.icon}
              </span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {category.label}
                </h1>
                <p className="mt-2 text-green-100 text-base md:text-lg max-w-xl">
                  {category.description}
                </p>
                {!loading && (
                  <p className="mt-1 text-green-200 text-sm">
                    {categoryCourses.length} course
                    {categoryCourses.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Group badge */}
            <div className="mt-4">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {category.group}
              </span>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="px-6 py-4 max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${categoryCourses.length} course${categoryCourses.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label="Sort courses"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Create course CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
        </div>

        {/* ── Course grid ── */}
        <div className="px-6 pb-10 max-w-5xl mx-auto">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <CourseCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : categoryCourses.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-7xl mb-6" role="img" aria-label="empty">
                {category.icon}
              </span>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No courses yet in {category.label}
              </h2>
              <p className="text-muted-foreground max-w-sm mb-6">
                Be the first educator to share knowledge in this discipline. The
                Ummah is waiting for you!
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3 font-semibold hover:bg-accent/90 transition-colors shadow"
              >
                <Plus className="w-5 h-5" />
                Create the first course
              </button>
              <Link
                href="/dashboard/courses/categories"
                className="mt-4 text-sm text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
              >
                Browse other categories
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {categoryCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Course modal */}
      <Modal
        title="Create Course"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-md w-full"
      >
        <CreateCourseForm />
      </Modal>
    </>
  );
}
