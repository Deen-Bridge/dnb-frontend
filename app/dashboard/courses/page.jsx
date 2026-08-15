"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Bookmark, Plus } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import useAuth from "@/hooks/useAuth";
import { useAllCourseProgress } from "@/hooks/useCourseProgress";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

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
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
              )}
            >
              {showBookmarks ? "My Bookmarked Courses" : "All Courses"}
            </h1>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              {showBookmarks
                ? "Courses you've saved for later"
                : "Browse and enroll in courses"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            round
            outlined
            onClick={() => (window.location.href = "/dashboard/courses/create")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
          <Button
            round
            outlined={!showBookmarks}
            className={showBookmarks ? "bg-accent text-white" : ""}
            onClick={() => setShowBookmarks(!showBookmarks)}
          >
            <Bookmark className="h-4 w-4 mr-1" />
            {showBookmarks ? "Show All" : "Bookmarks"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <CourseCardSkeleton key={`skeleton-${idx}`} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
              <GraduationCap className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className={cn(poppins_600, "text-lg text-ink")}>
                {showBookmarks ? "No Bookmarked Courses" : "No Courses Yet"}
              </h3>
              <p
                className={cn(
                  poppins_400,
                  "mt-1 max-w-md text-sm text-ink-muted"
                )}
              >
                {showBookmarks
                  ? "Start bookmarking courses you're interested in!"
                  : "No courses available at the moment."}
              </p>
            </div>
            {!showBookmarks && (
              <Button
                round
                outlined
                onClick={() =>
                  (window.location.href = "/dashboard/courses/create")
                }
              >
                Create Course
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      )}
    </div>
  );
}
