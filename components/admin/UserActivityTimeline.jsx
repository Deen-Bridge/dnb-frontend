"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BookOpen,
  Clock,
  FileCheck,
  LogIn,
  MessageSquare,
  Receipt,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  fetchUserActivityTimeline,
  paginateActivityEvents,
} from "@/lib/actions/admin-user-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const PAGE_SIZE = 10;

const TYPE_META = {
  signup: { icon: UserPlus, label: "Account", className: "bg-primary/10 text-primary" },
  login: { icon: LogIn, label: "Login", className: "bg-blue-100 text-blue-700" },
  purchase: { icon: Receipt, label: "Purchase", className: "bg-emerald-100 text-emerald-700" },
  enrollment: { icon: BookOpen, label: "Enrollment", className: "bg-amber-100 text-amber-700" },
  messages: { icon: MessageSquare, label: "Messages", className: "bg-violet-100 text-violet-700" },
  verification: { icon: FileCheck, label: "Verification", className: "bg-sky-100 text-sky-700" },
};

/**
 * Merged user activity timeline (#227): logins, purchases, enrollments,
 * message totals and verification events in one chronological feed with
 * cursor ("load more") pagination. The feed is composed client-side by
 * `lib/actions/admin-user-timeline`.
 */
export default function UserActivityTimeline({ user }) {
  const userId = user?._id;
  const [state, setState] = useState({
    loading: true,
    events: [],
    degraded: [],
    error: null,
    cursor: null,
  });
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setState({ loading: false, events: [], degraded: [], error: null, cursor: null });
      return () => {
        active = false;
      };
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchUserActivityTimeline(user)
      .then((result) => {
        if (!active) return;
        setState({
          loading: false,
          events: result.events || [],
          degraded: result.degraded || [],
          error: null,
          cursor: null,
        });
        setShown(PAGE_SIZE);
      })
      .catch((err) => {
        if (!active) return;
        setState({
          loading: false,
          events: [],
          degraded: [],
          error: err?.message || "The activity timeline could not be loaded.",
          cursor: null,
        });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-fetch only when the viewed user changes
  }, [userId]);

  const page = paginateActivityEvents(state.events, null, shown);
  const hasMore = page.nextCursor !== null;

  return (
    <Card className="border shadow-none" data-testid="activity-timeline">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Activity Timeline
        </CardTitle>
        <CardDescription className="text-xs">
          Logins, purchases, enrollments, messaging and verification events merged into one
          chronological feed, newest first
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {state.degraded.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Some sources are unavailable:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {state.degraded.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {state.loading ? (
          <div className="space-y-2" aria-label="Loading activity timeline">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : state.error ? (
          <p role="alert" className="text-xs text-destructive">
            {state.error}
          </p>
        ) : state.events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <>
            <ol className="relative border-l pl-4">
              {page.items.map((event) => {
                const meta = TYPE_META[event.type] || TYPE_META.signup;
                const Icon = meta.icon;
                return (
                  <li key={event.id} className="relative pb-5 last:pb-0">
                    <span
                      className={cn(
                        "absolute -left-[21px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
                        meta.className
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{event.title}</span>
                          <span className="rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {meta.label}
                          </span>
                        </div>
                        {event.detail && (
                          <p className="text-xs text-muted-foreground">{event.detail}</p>
                        )}
                        {event.actor && (
                          <p className="text-xs text-muted-foreground">
                            Actor: <span className="font-medium text-foreground">{event.actor}</span>
                          </p>
                        )}
                      </div>
                      <time
                        dateTime={event.timestamp}
                        title={dayjs(event.timestamp).format("LLL")}
                        className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                      >
                        {dayjs(event.timestamp).fromNow()}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ol>

            {hasMore ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShown((prev) => prev + PAGE_SIZE)}
              >
                Load more ({state.events.length - page.items.length} remaining)
              </Button>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                End of timeline · {state.events.length} event
                {state.events.length === 1 ? "" : "s"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}