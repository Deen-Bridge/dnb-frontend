import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/actions/courses/get-course";
import CourseDetailClient from "./CourseDetailPageClient";
export default async function Page({ params }) {
  const { courseId } = params;
  const course = await getCourseById(courseId);

  if (!course) return notFound();

  return <CourseDetailClient course={course} />;
}