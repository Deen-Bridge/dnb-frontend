"use client";

import { useEffect } from "react";
import { captureClientError } from "@/lib/sentry/captureClientError";

export default function GlobalError({ error }) {
  useEffect(() => {
    captureClientError(error);
  }, [error]);

  return (
    <html lang="en">
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
          <p style={{ fontSize: "1.125rem", marginBottom: "1.5rem" }}>
            Something went wrong
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#ffffff",
              color: "#092601",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
