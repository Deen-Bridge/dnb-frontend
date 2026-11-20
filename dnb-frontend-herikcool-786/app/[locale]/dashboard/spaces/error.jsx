"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function SpacesError({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Couldn't load live spaces" description="Live spaces are temporarily unavailable. Retry or return to your dashboard." homeHref="/dashboard" retryLabel="Retry" />;
}
