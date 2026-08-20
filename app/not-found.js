"use client";

import Link from "next/link";

// Global fallback for requests that never reach the `[locale]` layout — e.g. a
// hand-typed URL whose first segment isn't a known locale, which makes the
// locale layout call `notFound()` outside of it. Because there is no root layout
// (the served `<html>` lives in `app/[locale]/layout.js`), this page renders its
// own minimal HTML document. In-app 404s are handled by `app/[locale]/not-found`.
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          fontFamily: "system-ui, sans-serif",
          background: "#092601",
          color: "#f8fafc",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>404</h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          This page could not be found.
        </p>
        <Link
          href="/"
          style={{
            marginTop: "0.5rem",
            color: "#4ade80",
            textDecoration: "underline",
          }}
        >
          Go back home
        </Link>
      </body>
    </html>
  );
}
