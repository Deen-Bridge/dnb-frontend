import { cache } from "react";
import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/actions/courses/get-course";
import CourseDetailClient from "./CourseDetailPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl, siteName } from "@/lib/config/site.config";
import { truncateText } from "@/lib/utils/seo";

// getCourseById uses axios (not fetch), so Next cannot deduplicate it between
// generateMetadata and the page — React cache() does that for us instead,
// keeping it to a single backend hit per request.
const getCourse = cache(getCourseById);

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) return {};

  const title = `${course.title} | Deen Bridge`;
  const description = truncateText(course.description, 160) || `${course.title} — an authentic Islamic course on Deen Bridge.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/dashboard/courses/${courseId}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/dashboard/courses/${courseId}`,
      siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildCourseJsonLd(course) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: truncateText(course.description, 160) || undefined,
    provider: {
      "@type": "Organization",
      name: siteName,
      sameAs: siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: course.price ?? 0,
      priceCurrency: "USD",
      category: course.price === 0 ? "Free" : "Paid",
      availability: "https://schema.org/InStock",
    },
  };

  if (course.createdBy?.name) {
    schema.instructor = {
      "@type": "Person",
      name: course.createdBy.name,
    };
  }

  return schema;
}

export default async function Page({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) return notFound();

  return (
    <>
      <JsonLd data={buildCourseJsonLd(course)} />
      <CourseDetailClient course={course} />
    </>
  );
}