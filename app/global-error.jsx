"use client";

import { useEffect, useState } from "react";
import { captureClientError } from "@/lib/sentry/captureClientError";

export default function GlobalError({ error }) {
  const [incidentId, setIncidentId] = useState("pending");

  useEffect(() => {
    let active = true;
    const fallback = `WEB-${Date.now().toString(36).toUpperCase()}`;
    captureClientError(error).then((eventId) => {
      if (active) setIncidentId(eventId || fallback);
    });
    return () => {
      active = false;
    };
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#092601",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          color: "#ffffff",
        }}
      >
        <main
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "28rem",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            DeenBridge
          </h1>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
            Something went wrong. You can retry or return home.
          </p>
          <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem", opacity: 0.85 }}>
            Reference: <code>{incidentId}</code>
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: "0.625rem 1.5rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#ffffff", color: "#092601", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>
              Try again
            </button>
            <a href="/en" style={{ padding: "0.625rem 1.5rem", borderRadius: "0.5rem", border: "1px solid #ffffff", color: "#ffffff", fontWeight: 600, fontSize: "1rem" }}>
              Go home
            </a>
            <a href="mailto:support@deenbridge.org" style={{ padding: "0.625rem 1.5rem", borderRadius: "0.5rem", border: "1px solid #ffffff", color: "#ffffff", fontWeight: 600, fontSize: "1rem" }}>
              Contact support
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
