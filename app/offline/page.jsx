import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 text-center">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            <svg
              aria-hidden="true"
              className="h-10 w-10 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M12 12h.01"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-foreground">
          You&apos;re Offline
        </h1>
        <p className="mb-8 text-muted-foreground">
          Deen Bridge is designed to work partially offline. You can still read
          recently opened books and access cached content.
        </p>

        <div className="mb-8 rounded-2xl border border-border/50 bg-white/80 p-6 text-left shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What still works
          </h2>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
                ✓
              </span>
              Previously opened books (PDF reader)
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
                ✓
              </span>
              Cached course content and pages
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                —
              </span>
              Messages, payments, and live spaces need a connection
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-accent/90"
          >
            Try Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            Go Home
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Reconnect to the internet to access all features.
        </p>
      </div>
    </div>
  );
}
