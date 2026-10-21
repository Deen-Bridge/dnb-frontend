"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, Flag, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchVerificationQueue } from "@/lib/actions/admin-verifications";
import { listReports } from "@/lib/actions/admin-reports";
import { fetchOpenDisputeCount } from "@/lib/actions/admin-disputes";

const QUEUES = [
  {
    key: "verifications",
    label: "Pending verifications",
    href: "/admin/educators",
    Icon: ClipboardCheck,
  },
  {
    key: "reports",
    label: "Flagged content",
    href: "/admin/reports",
    Icon: Flag,
  },
  {
    key: "disputes",
    label: "Open disputes",
    href: "/admin/payments/disputes",
    Icon: Scale,
  },
];

export default function PendingModerationSummary() {
  const [counts, setCounts] = useState({
    verifications: null,
    reports: null,
    disputes: null,
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchVerificationQueue({ status: "pending", page: 1, limit: 1 })
        .then((result) => result?.counts?.pending ?? result?.total ?? null)
        .catch(() => null),
      listReports({ status: "open" })
        .then((result) => result?.reports?.length ?? null)
        .catch(() => null),
      fetchOpenDisputeCount(),
    ]).then(([verifications, reports, disputes]) => {
      if (active) setCounts({ verifications, reports, disputes });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Needs attention</CardTitle>
        <CardDescription>Open moderation queues</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {QUEUES.map(({ key, label, href, Icon }) => {
          const count = counts[key];
          const hasItems = typeof count === "number" && count > 0;
          return (
            <Link
              key={key}
              href={href}
              className="group rounded-lg border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <Icon
                  className={`h-4 w-4 ${hasItems ? "text-accent" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <p className={`mt-3 text-2xl font-semibold ${hasItems ? "text-accent" : ""}`}>
                {typeof count === "number" ? count : "—"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              {count === null && (
                <p className="mt-1 text-xs text-muted-foreground">Queue count unavailable</p>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
