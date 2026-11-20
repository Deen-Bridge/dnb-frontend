"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function ScholarshipsError({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Couldn't load scholarships" description="Scholarship data is temporarily unavailable. Retry before submitting a decision." homeHref="/dashboard" retryLabel="Retry" />;
}
