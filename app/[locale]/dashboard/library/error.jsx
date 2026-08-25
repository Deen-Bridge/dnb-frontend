"use client";

import { useEffect } from "react";
import { captureClientError } from "@/lib/sentry/captureClientError";

export default function LibraryError({ error, reset }) {
  useEffect(() => {
    captureClientError(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 className="text-xl font-bold mb-2">Couldn&apos;t load this library item</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The library item failed to load. Please retry — your reading progress
        is saved.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
