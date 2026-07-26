import CourseWizard from "@/components/organisms/create/course-wizard";

export default async function EditCoursePage({ params }) {
  const { courseId } = await params;

  return <CourseWizard courseId={courseId} />;
}
