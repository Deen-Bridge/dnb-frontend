"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function LibraryError({ error, reset }) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <h2 className="text-xl font-bold text-[#252F40] mb-3">
          Couldn&apos;t load your library
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          We ran into a problem fetching this content. Please retry.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-lg bg-[#34AD5D] text-white text-sm font-medium hover:bg-[#2c9350] transition-colors"
        >
          Retry
        </button>
        {eventId && (
          <p className="mt-6 text-xs text-gray-400">Report ID: {eventId}</p>
        )}
      </div>
    </div>
  );
}
