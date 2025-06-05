"use client";
import { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import CreateCourseForm from "@/components/organisms/create/course-create-form";
import axiosInstance from "@/lib/config/axios.config";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-muted">
        <div className="flex justify-between items-center p-5">
          <h2 className="font-semibold text-lg sm:text-3xl text-accent ">
            Courses created to suit your soul
          </h2>
          <Button
            round
            outlined
            className="text-xs sm:text-normal"
            onClick={() => setModalOpen(!modalOpen)}
          >
            Create Course
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
            {courses?.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
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
