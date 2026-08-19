import CourseWizard from "@/components/organisms/create/course-wizard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CAPABILITIES } from "@/lib/auth/roles";

export default function CreateCoursePage() {
  return (
    <RoleGuard capability={CAPABILITIES.COURSE_CREATE}>
      <CourseWizard />
    </RoleGuard>
  );
}
