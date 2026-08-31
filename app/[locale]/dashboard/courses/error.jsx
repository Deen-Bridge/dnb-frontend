"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function CoursesError({ error, reset }) {
  return (
    <ErrorBoundaryUI
      error={error}
      reset={reset}
      title="Couldn't load courses"
      description="The course content failed to load. Please retry — your progress is saved."
      homeHref="/dashboard/courses"
    />
  );
}
