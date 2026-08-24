import { getCourseById } from "@/lib/actions/courses/get-course";
import {
  renderOgCard,
  OG_IMAGE_SIZE,
} from "@/components/seo/renderOgCard";

export const runtime = "nodejs";
export const alt = "Deen Bridge course";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({ params }) {
  const { courseId } = await params;

  let course = null;
  try {
    course = await getCourseById(courseId);
  } catch {
    course = null;
  }

  const title = course?.title || "Learn authentic Islamic knowledge";
  const subtitle = course?.createdBy?.name
    ? `Taught by ${course.createdBy.name}`
    : "Courses on Qur'an, Arabic, fiqh and more — on Deen Bridge.";
  const badge = course
    ? course.price === 0
      ? "Free"
      : `$${course.price} USDC`
    : "Deen Bridge";

  return renderOgCard({ title, subtitle, badge });
}