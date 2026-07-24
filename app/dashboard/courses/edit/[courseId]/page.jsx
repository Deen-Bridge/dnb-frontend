"use client";
import React from "react";
import { useParams } from "next/navigation";
import CourseWizard from "@/components/organisms/create/course-wizard";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params?.courseId;

  return <CourseWizard courseId={courseId} />;
}
