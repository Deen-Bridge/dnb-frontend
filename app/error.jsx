"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

// Kept dependency-light on purpose (no toasts, providers, or design-system
// imports) so this boundary can't itself throw while trying to render a
// recovery UI for an unrelated error.
export default function Error({ error, reset }) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-[#252F40] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          An unexpected error occurred while loading this page. You can try
          again, or head back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-[#34AD5D] text-white text-sm font-medium hover:bg-[#2c9350] transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-[#252F40] text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go home
          </a>
        </div>
        {eventId && (
          <p className="mt-6 text-xs text-gray-400">Report ID: {eventId}</p>
        )}
      </div>
    </div>
  );
}
