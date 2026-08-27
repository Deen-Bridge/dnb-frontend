"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function DashboardError({ error, reset }) {
  return (
    <ErrorBoundaryUI
      error={error}
      reset={reset}
      title="We couldn't load your dashboard"
      description="Something interrupted this page. The rest of DeenBridge is still available from the sidebar — or try again now."
      homeHref="/dashboard"
    />
  );
}
