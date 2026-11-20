"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function LibraryError({ error, reset }) {
  return (
    <ErrorBoundaryUI
      error={error}
      reset={reset}
      title="Couldn't load this library item"
      description="The library item failed to load. Please retry — your reading progress is saved."
      homeHref="/dashboard/library"
    />
  );
}
