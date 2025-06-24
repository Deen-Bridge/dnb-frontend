"use client";
import { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetchCourses();
        setCourses(response);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <NetworkErrorComp errMsg="Failed to get courses, reload or try again later" />;
  }

  return (
    <>
      <div className="bg-muted h-full w-full">
        <div className="flex justify-between items-center p-5">
          <h2 className="font-semibold text-lg sm:text-3xl text-accent ">
            Courses created to suit your soul
          </h2>
          <Button
            round
            outlined
            className="text-normal"
            onClick={() => setModalOpen(!modalOpen)}
          >
            Create Course
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
            {loading ? (
              [...Array(6)].map((_, idx) => (
                <CourseCardSkeleton key={`skeleton-${idx}`} />
              ))
            ) : (
              courses
                .filter((course) => course.createdBy._id !== user._id)
                .map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))
            )}
          </div>
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