"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function PurchasesError({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Couldn't load purchases" description="Your purchases are temporarily unavailable. Retry before trying another payment." homeHref="/dashboard" retryLabel="Retry" />;
}
