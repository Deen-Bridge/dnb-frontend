"use client";
import { useEffect, useState } from "react";
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
import { useAllCourseProgress } from "@/hooks/useCourseProgress";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const { user } = useAuth();
  const { progressMap } = useAllCourseProgress();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

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
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => (window.location.href = "/dashboard/courses/create")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
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

      {loading ? (
        <CardGrid>
          {[...Array(6)].map((_, idx) => (
            <CourseCardSkeleton key={`skeleton-${idx}`} />
          ))}
        </CardGrid>
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
            !showBookmarks && (
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
      ) : (
        <CardGrid>
          {courses
            .filter(
              (course) =>
                showBookmarks || course?.createdBy?._id !== user?._id
            )
            .map((course) => (
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
}
