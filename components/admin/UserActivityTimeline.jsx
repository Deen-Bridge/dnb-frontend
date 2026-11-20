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
import { fetchUserActivityTimeline } from "@/lib/actions/admin-user-timeline";
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

function mergeEvents(existing, incoming) {
  const ids = new Set(existing.map((event) => event.id));
  return [...existing, ...incoming.filter((event) => !ids.has(event.id))];
}

export default function UserActivityTimeline({ user }) {
  const userId = user?._id;
  const [state, setState] = useState({
    loading: true,
    loadingMore: false,
    events: [],
    degraded: [],
    error: null,
    nextCursor: null,
    snapshot: null,
  });

  const loadPage = async ({ cursor = null, snapshot = null, append = false } = {}) => {
    if (!userId) return;
    setState((prev) => ({ ...prev, loading: !append, loadingMore: append, error: null }));
    try {
      const page = await fetchUserActivityTimeline(userId, { cursor, snapshot, limit: PAGE_SIZE });
      setState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
        events: append ? mergeEvents(prev.events, page.events) : page.events,
        degraded: page.degraded,
        nextCursor: page.nextCursor,
        snapshot: page.snapshot || prev.snapshot,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: error?.message || "The server-authoritative activity timeline is unavailable.",
      }));
    }
  };

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, loadingMore: false, events: [], degraded: [], error: null, nextCursor: null, snapshot: null });
      return undefined;
    }
    void loadPage();
    // The viewed user is the only fetch key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Card className="border shadow-none" data-testid="activity-timeline">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Activity Timeline
        </CardTitle>
        <CardDescription className="text-xs">
          Server-authoritative account activity with audited provenance, newest first
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {state.degraded.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Some server sources are unavailable:</p>
            <ul className="list-disc pl-4 space-y-0.5">{state.degraded.map((note) => <li key={note}>{note}</li>)}</ul>
          </div>
        )}
        {state.loading ? (
          <div className="space-y-2" aria-label="Loading activity timeline">
            <Skeleton className="h-12 w-full rounded-md" /><Skeleton className="h-12 w-full rounded-md" /><Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : state.error ? (
          <div className="space-y-2" role="alert">
            <p className="text-xs text-destructive">{state.error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadPage()}><RefreshCw className="mr-2 h-3 w-3" /> Try again</Button>
          </div>
        ) : state.events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No server activity is available for this account.</p>
        ) : (
          <>
            <ol className="relative border-l pl-4">
              {state.events.map((event) => {
                const meta = TYPE_META[event.type] || TYPE_META.signup;
                const Icon = meta.icon;
                return (
                  <li key={event.id} className="relative pb-5 last:pb-0">
                    <span className={cn("absolute -left-[21px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background", meta.className)} aria-hidden="true"><Icon className="h-2.5 w-2.5" /></span>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{event.title}</span><span className="rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{meta.label}</span></div>
                        {event.detail && <p className="text-xs text-muted-foreground">{event.detail}</p>}
                        <p className="text-[10px] text-muted-foreground">Source: {event.provenance} · {event.timestampSemantics}</p>
                        {event.actor && <p className="text-xs text-muted-foreground">Actor: <span className="font-medium text-foreground">{event.actor}</span></p>}
                      </div>
                      <time dateTime={event.timestamp} title={dayjs(event.timestamp).format("LLL")} className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">{dayjs(event.timestamp).fromNow()}</time>
                    </div>
                  </li>
                );
              })}
            </ol>
            {state.nextCursor ? (
              <Button type="button" variant="outline" size="sm" className="w-full" disabled={state.loadingMore} onClick={() => void loadPage({ cursor: state.nextCursor, snapshot: state.snapshot, append: true })}>
                {state.loadingMore && <RefreshCw className="mr-2 h-3 w-3 animate-spin" />}{state.loadingMore ? "Loading more…" : "Load more"}
              </Button>
            ) : <p className="text-center text-xs text-muted-foreground">End of server timeline · {state.events.length} event{state.events.length === 1 ? "" : "s"}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
