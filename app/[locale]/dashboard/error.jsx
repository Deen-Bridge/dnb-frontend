"use client";

import { useEffect, useState } from "react";
import { captureClientError } from "@/lib/sentry/captureClientError";

export default function DashboardError({ error, reset }) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    let active = true;
    captureClientError(error).then((id) => {
      if (active && id) setEventId(id);
    });
    return () => {
      active = false;
    };
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 className="text-2xl font-bold mb-2">We couldn&apos;t load your dashboard</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Something interrupted this page. The rest of DeenBridge is still
        available from the sidebar — or try again now.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Try again
      </button>
      {eventId ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Report ID: {eventId}
        </p>
      ) : null}
    </div>
  );
}
