"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

// Renders inside app/dashboard/layout.jsx's <SidebarInset>, so the sidebar
// and nav header stay usable while just this segment shows the fallback.
export default function DashboardError({ error, reset }) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <h2 className="text-xl font-bold text-[#252F40] mb-3">
          This page ran into a problem
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Something went wrong loading your dashboard. Try again, or use the
          sidebar to head somewhere else.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-lg bg-[#34AD5D] text-white text-sm font-medium hover:bg-[#2c9350] transition-colors"
        >
          Try again
        </button>
        {eventId && (
          <p className="mt-6 text-xs text-gray-400">Report ID: {eventId}</p>
        )}
      </div>
    </div>
  );
}
