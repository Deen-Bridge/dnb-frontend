"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

// This only activates in production builds (test with `npm run build && npm
// start`). No app providers, fonts, or global stylesheet are guaranteed to
// be available here, so this stays fully self-contained with inline styles
// and renders its own <html>/<body>.
export default function GlobalError({ error, reset }) {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#252F40",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Deen Bridge
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28 }}>
            Something went wrong and this page couldn&apos;t load. Please
            reload to try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#34AD5D",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          {eventId && (
            <p style={{ marginTop: 20, fontSize: 12, color: "#9ca3af" }}>
              Report ID: {eventId}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
