"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Bookmark, Plus } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import useAuth from "@/hooks/useAuth";
import { useCan } from "@/hooks/useCan";
import { CAPABILITIES } from "@/lib/auth/roles";
import { useAllCourseProgress } from "@/hooks/useCourseProgress";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
  ISLAMIC_CATEGORIES,
  resolveCategorySlug,
  sortCourses,
} from "@/lib/categories";
import { cn } from "@/lib/utils";

const CourseGridSkeleton = () => (
  <CardGrid>
    {[...Array(6)].map((_, idx) => (
      <CourseCardSkeleton key={`skeleton-${idx}`} />
    ))}
  </CardGrid>
);

const CoursesPageContent = () => {
  const { user } = useAuth();
  const { can } = useCan();
  const canCreateCourse = can(CAPABILITIES.COURSE_CREATE);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progressMap } = useAllCourseProgress();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [category, setCategory] = useState(
    () => searchParams.get("category") || ""
  );
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || ""
  );

  const search = useDebouncedValue(searchInput, 300);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      if (showBookmarks) {
        const response = await getBookmarkedCourses();
        setCourses(response.bookmarks || []);
      } else {
        const response = await fetchCourses();
        setCourses(response);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showBookmarks]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    const query = params.toString();
    router.replace(query ? `?${query}` : "/dashboard/courses", {
      scroll: false,
    });
  }, [search, category, sort, router]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = courses.filter((course) => {
      if (!showBookmarks && course?.createdBy?._id === user?._id) return false;

      if (category && resolveCategorySlug(course?.category) !== category) {
        return false;
      }

      if (term) {
        const title = String(course?.title || "").toLowerCase();
        const description = String(course?.description || "").toLowerCase();
        const instructor = String(course?.createdBy?.name || "").toLowerCase();
        if (
          !title.includes(term) &&
          !description.includes(term) &&
          !instructor.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });

    return sortCourses(result, sort);
  }, [courses, search, category, sort, showBookmarks, user?._id]);

  const handleClearFilters = () => {
    setSearchInput("");
    setCategory("");
    setSort("newest");
  };

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to get courses, reload or try again later"
        reset={() => fetchData()}
      />
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={GraduationCap}
        title={showBookmarks ? "My Bookmarked Courses" : "All Courses"}
        subtitle={
          showBookmarks
            ? "Courses you've saved for later"
            : "Browse and enroll in courses"
        }
        actions={
          <>
            {canCreateCourse && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => (window.location.href = "/dashboard/courses/create")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            )}
            <Button
              variant={showBookmarks ? "default" : "outline"}
              className={cn("rounded-full", showBookmarks && "bg-accent text-white hover:bg-accent/90")}
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              {showBookmarks ? "Show All" : "Bookmarks"}
            </Button>
          </>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
            !category
              ? "bg-accent text-white border-accent"
              : "border-accent/20 bg-surface-raised text-ink hover:border-secondary/40"
          )}
        >
          All
        </button>
        {ISLAMIC_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              category === cat.slug
                ? "bg-accent text-white border-accent"
                : "border-accent/20 bg-surface-raised text-ink hover:border-secondary/40"
            )}
          >
            {cat.shortLabel || cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          aria-label="Filter courses"
          type="text"
          placeholder="Search courses..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-64 rounded-full border border-accent/20 bg-surface-raised px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          aria-label="Sort courses"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-accent/20 bg-surface-raised px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {loading ? (
        <CourseGridSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={showBookmarks ? "No Bookmarked Courses" : "No Courses Yet"}
          description={
            showBookmarks
              ? "Start bookmarking courses you're interested in!"
              : "No courses available at the moment."
          }
          action={
            !showBookmarks && canCreateCourse && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  (window.location.href = "/dashboard/courses/create")
                }
              >
                Create Course
              </Button>
            )
          }
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Matching Courses"
          description="No courses match your filters. Try widening your search."
          action={
            <Button variant="outline" className="rounded-full" onClick={handleClearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <CardGrid>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              progress={progressMap[course._id]}
              onBookmarkChange={(isBookmarked) => {
                if (showBookmarks && !isBookmarked) {
                  setCourses(courses.filter((c) => c._id !== course._id));
                }
              }}
            />
          ))}
        </CardGrid>
      )}
    </PageShell>
  );
};

const CoursesPage = () => (
  <Suspense
    fallback={
      <div className="bg-surface p-4 sm:p-6">
        <CourseGridSkeleton />
      </div>
    }
  >
    <CoursesPageContent />
  </Suspense>
);

export default CoursesPage;