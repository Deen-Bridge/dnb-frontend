"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function RootError({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} homeHref="/" />;
}
