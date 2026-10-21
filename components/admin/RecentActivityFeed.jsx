"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  UserPlus,
  GraduationCap,
  CreditCard,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useRecentEvents from "@/hooks/useRecentEvents";

dayjs.extend(relativeTime);

const EVENT_ICONS = {
  user_signup: UserPlus,
  course_published: GraduationCap,
  payment: CreditCard,
  report: Flag,
  verification: ShieldCheck,
};

export default function RecentActivityFeed() {
  const { events, loading, error } = useRecentEvents();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" aria-hidden="true" />
            Recent activity
          </CardTitle>
          <CardDescription>Latest platform events, refreshed every 30 seconds.</CardDescription>
        </div>
        {/* Stub: dedicated activity page is not built yet; reuse activity monitor. */}
        <Link href="/admin/activity-monitor" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2" data-testid="activity-loading">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : error && events.length === 0 ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto">
            {events.map((event) => {
              const Icon = EVENT_ICONS[event.type] || Activity;
              return (
                <li key={event.id} className="flex items-start gap-3 text-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/users/${event.actorId}`}
                      className="font-medium hover:underline"
                    >
                      {event.actorName}
                    </Link>{" "}
                    <span className="text-muted-foreground">{event.description}</span>
                  </span>
                  <time
                    dateTime={event.createdAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {dayjs(event.createdAt).fromNow()}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
