"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Bookmark, Plus } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

export default function CoursesPage() {
  const { user } = useAuth();
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            {showBookmarks ? "My Bookmarked Courses" : "All Courses"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {showBookmarks
              ? "Courses you've saved for later"
              : "Browse and enroll in courses"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            round
            outlined
            onClick={() => window.location.href = "/dashboard/courses/create"}
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">
                {showBookmarks ? "No Bookmarked Courses" : "No Courses Yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                {showBookmarks
                  ? "Start bookmarking courses you're interested in!"
                  : "No courses available at the moment."}
              </p>
            </div>
            {!showBookmarks && (
              <Button
                round
                outlined
                onClick={() => window.location.href = "/dashboard/courses/create"}
              >
                Create Course
              </Button>
            )}
          </CardContent>
        </Card>
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
