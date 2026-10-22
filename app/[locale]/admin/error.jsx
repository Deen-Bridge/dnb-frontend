"use client";

import { useEffect } from "react";
import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin area error:", error);
  }, [error]);

  return (
    <ErrorBoundaryUI
      error={error}
      reset={reset}
      title="We couldn't load the admin area"
      description="Something interrupted this page. Reload the admin area or return to its overview."
      homeHref="/admin"
      retryLabel="Reload"
      homeLabel="Back to overview"
    />
  );
}
