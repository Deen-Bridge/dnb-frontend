import CourseWizard from "@/components/organisms/create/course-wizard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CAPABILITIES } from "@/lib/auth/roles";

export default async function EditCoursePage({ params }) {
  const { courseId } = await params;

  return (
    <RoleGuard capability={CAPABILITIES.COURSE_EDIT}>
      <CourseWizard courseId={courseId} />
    </RoleGuard>
  );
}
