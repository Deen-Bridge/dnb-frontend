"use client";

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

export default function AiChatError({ error, reset }) {
  return (
    <ErrorBoundaryUI
      error={error}
      reset={reset}
      title="Couldn't load AI chat"
      description="The AI chat failed to load. Please try again."
      homeHref="/dashboard/ai"
    />
  );
}
