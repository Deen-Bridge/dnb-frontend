"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { CATEGORIES, resolveSlug } from "@/lib/categories";
import { getAverageRating } from "@/hooks/getAverageRating";
import { Search, X, LayoutGrid } from "lucide-react";
import Link from "next/link";

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
          getAverageRating(b.reviews || []) - getAverageRating(a.reviews || [])
      );
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
  }
}

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven state
  const urlCategory = searchParams.get("category") || "";
  const urlSort = searchParams.get("sort") || "newest";
  const urlSearch = searchParams.get("q") || "";

  // Local filter state (mirrors URL, kept in sync)
  const [search, setSearch] = useState(urlSearch);

  const [allCourses, setAllCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Keep local search in sync when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // ── helpers ─────────────────────────────────────────────────────────────────

  /** Push a filter change into the URL without adding a history entry */
  const updateURL = useCallback(
    (patches) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patches).forEach(([k, v]) => {
        if (v) {
          params.set(k, v);
        } else {
          params.delete(k);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleCategoryClick = (slug) => {
    updateURL({ category: urlCategory === slug ? "" : slug });
  };

  const handleSortChange = (e) => {
    updateURL({ sort: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateURL({ q: search });
  };

  const handleClearFilters = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  // ── data fetching ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (showBookmarks) {
        const response = await getBookmarkedCourses();
        setAllCourses(response.bookmarks || []);
      } else {
        const response = await fetchCourses();
        setAllCourses(response);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [showBookmarks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── derived / filtered list ─────────────────────────────────────────────────

  const displayedCourses = useMemo(() => {
    let list = allCourses.filter(
      (course) => showBookmarks || course?.createdBy?._id !== user?._id
    );

    // Category filter
    if (urlCategory) {
      list = list.filter((course) => resolveSlug(course.category) === urlCategory);
    }

    // Text search filter
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      list = list.filter(
        (course) =>
          course.title?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q) ||
          course.category?.toLowerCase().includes(q)
      );
    }

    return sortCourses(list, urlSort);
  }, [allCourses, urlCategory, urlSearch, urlSort, showBookmarks, user]);

  const hasActiveFilters = urlCategory || urlSearch || urlSort !== "newest";

  // ── render ───────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to get courses, reload or try again later"
        reset={() => fetchData()}
      />
    );
  }

  return (
    <>
      <div className="bg-muted h-full w-full">
        {/* ── Top bar ── */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-5">
          <h2 className="text-2xl font-bold">
            {showBookmarks ? "My Bookmarked Courses" : "All Courses"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/courses/categories"
              className="inline-flex items-center gap-1 rounded-full border border-accent text-accent px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse Categories
            </Link>
            <Button
              round
              outlined
              className="text-normal"
              onClick={() => setModalOpen(!modalOpen)}
            >
              Create Course
            </Button>
            <Button
              round
              outlined={!showBookmarks}
              className={showBookmarks ? "bg-accent text-white" : "text-normal"}
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              {showBookmarks ? "Show All" : "Bookmarks"}
            </Button>
          </div>
        </div>

        {/* ── Filters bar ── */}
        {!showBookmarks && (
          <div className="px-5 pb-4 space-y-3">
            {/* Text search + sort row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Sort select */}
              <select
                value={urlSort}
                onChange={handleSortChange}
                className="rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                aria-label="Sort courses"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            {/* Category chips — horizontally scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const isActive = urlCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-accent text-white border-accent shadow"
                        : "bg-background border-input text-foreground hover:border-accent hover:text-accent"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Active category label */}
            {urlCategory && (
              <p className="text-sm text-muted-foreground">
                Showing courses in:{" "}
                <span className="font-semibold text-accent">
                  {CATEGORIES.find((c) => c.slug === urlCategory)?.label ||
                    urlCategory}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Course grid ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <CourseCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {showBookmarks
                  ? "No bookmarked courses yet. Start bookmarking courses you're interested in!"
                  : urlCategory || urlSearch
                  ? "No courses match your filters. Try adjusting or clearing them."
                  : "No courses available at the moment."}
              </p>
              {(urlCategory || urlSearch) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:text-accent/80 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {displayedCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onBookmarkChange={(isBookmarked) => {
                    if (showBookmarks && !isBookmarked) {
                      setAllCourses((prev) =>
                        prev.filter((c) => c._id !== course._id)
                      );
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
