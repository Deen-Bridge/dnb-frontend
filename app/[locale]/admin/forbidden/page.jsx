"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import { ShieldX } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { Inter_800, Inter_400 } from "@/lib/config/font.config";
import { cn } from "@/lib/utils";

const ATTEMPT_LOG_KEY = "dnb:forbidden-page-attempts";

function logBlockedPageVisit(pathname) {
  try {
    const attempts = JSON.parse(window.localStorage.getItem(ATTEMPT_LOG_KEY) || "[]");
    const safeAttempts = Array.isArray(attempts) ? attempts : [];
    safeAttempts.push({ pathname, attemptedAt: new Date().toISOString() });
    window.localStorage.setItem(ATTEMPT_LOG_KEY, JSON.stringify(safeAttempts.slice(-20)));
  } catch {
    // Storage can be unavailable in private browsing; the page still works.
  }
}

export default function ForbiddenPage() {
  const locale = useLocale();
  const dashboardHref = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  const supportHref = locale === "en" ? "/account/support" : `/${locale}/account/support`;

  useEffect(() => {
    // Keep access-attempt telemetry in this browser only. Never send it to an API.
    logBlockedPageVisit(window.location.pathname);
  }, []);

  return (
    <PageShell className="flex min-h-[70vh] items-center justify-center">
      <main
        role="alert"
        className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-16 text-center"
      >
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-12 w-12 text-destructive" aria-hidden="true" />
        </div>
        <p className={cn("mb-4 text-4xl font-bold text-foreground", Inter_800.className)}>
          Access forbidden
        </p>
        <p className={cn("mb-8 text-lg text-muted-foreground", Inter_400.className)}>
          You don’t have permission to access this admin area. Your account and its
          data are unchanged. If you believe you should have access, contact support
          for help.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href={dashboardHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-bold text-white transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Return to dashboard
          </Link>
          <Link
            href={supportHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent/20 px-8 py-3 text-base font-semibold text-accent transition hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Contact account support
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
