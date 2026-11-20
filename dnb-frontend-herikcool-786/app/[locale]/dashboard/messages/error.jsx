"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function MessagesError({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Couldn't load messages" description="Messages are temporarily unavailable. Retry or return to your dashboard." homeHref="/dashboard" retryLabel="Retry" />;
}
