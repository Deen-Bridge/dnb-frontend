"use client";
import { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
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
    <>
      <div className="bg-muted h-full w-full">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-2xl font-bold">
            {showBookmarks ? "My Bookmarked Courses" : "All Courses"}
          </h2>
          <div className="flex gap-2">
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

        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
              {[...Array(6)].map((_, idx) => (
                <CourseCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {showBookmarks
                  ? "No bookmarked courses yet. Start bookmarking courses you're interested in!"
                  : "No courses available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
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
                      // If in bookmarks view and unbookmarked, remove from list
                      if (showBookmarks && !isBookmarked) {
                        setCourses(courses.filter((c) => c._id !== course._id));
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
