"use client";

/**
 * Admin Spaces Oversight (#270)
 *
 * Comprehensive overview of all live and scheduled community spaces.
 * - Table with title, host, type, scheduled time, status, participant count, flags
 * - Live rooms sorted to top with pulsing status dot
 * - Filters by host and status
 * - Em-dash for unknown participant counts
 * - Jitsi room type display
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Video,
  Users,
  Calendar,
  Radio,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Flag,
  AudioWaveform,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format, formatDistanceToNow } from "date-fns";

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_SPACES = [
  {
    id: "sp_001",
    title: "Quran Study Circle",
    host: { name: "Sheikh Ahmad", avatar: null },
    type: "jitsi",
    scheduledTime: new Date().toISOString(), // live now
    status: "live",
    participantCount: 24,
    flags: [],
  },
  {
    id: "sp_002",
    title: "Youth Halaqah",
    host: { name: "Ustadh Ibrahim", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    status: "scheduled",
    participantCount: null,
    flags: [],
  },
  {
    id: "sp_003",
    title: "Islamic History Discussion",
    host: { name: "Dr. Fatima", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    status: "ended",
    participantCount: null,
    flags: [],
  },
  {
    id: "sp_004",
    title: "Arabic Language Workshop",
    host: { name: "Sheikh Ahmad", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    status: "scheduled",
    participantCount: null,
    flags: ["flagged"],
  },
  {
    id: "sp_005",
    title: "Tafsir Session",
    host: { name: "Dr. Yusuf", avatar: null },
    type: "jitsi",
    scheduledTime: new Date().toISOString(), // live now
    status: "live",
    participantCount: 42,
    flags: [],
  },
  {
    id: "sp_006",
    title: "Seerah Study Group",
    host: { name: "Sister Maryam", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    status: "scheduled",
    participantCount: null,
    flags: [],
  },
  {
    id: "sp_007",
    title: "Fiqh Q&A",
    host: { name: "Sheikh Omar", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: "ended",
    participantCount: null,
    flags: [],
  },
  {
    id: "sp_008",
    title: "Hadith Sciences",
    host: { name: "Dr. Fatima", avatar: null },
    type: "jitsi",
    scheduledTime: new Date().toISOString(), // live now
    status: "live",
    participantCount: 15,
    flags: [],
  },
  {
    id: "sp_009",
    title: "Quran Recitation Circle",
    host: { name: "Ustadh Ibrahim", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    status: "scheduled",
    participantCount: null,
    flags: [],
  },
  {
    id: "sp_010",
    title: "Community Town Hall",
    host: { name: "Admin Team", avatar: null },
    type: "jitsi",
    scheduledTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    status: "ended",
    participantCount: null,
    flags: ["flagged"],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  live: {
    label: "Live",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  ended: {
    label: "Ended",
    color: "text-muted-foreground",
    bg: "bg-muted",
    badge: "bg-muted text-muted-foreground",
  },
};

function StatusDot({ status }) {
  if (status !== "live") return null;
  return (
    <span className="relative flex h-2.5 w-2.5" aria-label="Live">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
    </span>
  );
}

function formatScheduledTime(isoString) {
  const date = new Date(isoString);
  return format(date, "MMM d, yyyy · h:mm a");
}

function formatRelativeTime(isoString) {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true });
}

function sortSpacesByStatus(spaces) {
  const order = { live: 0, scheduled: 1, ended: 2 };
  return [...spaces].sort((a, b) => order[a.status] - order[b.status]);
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostFilter, setHostFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setSpaces(MOCK_SPACES);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  // Unique hosts for filter
  const hosts = useMemo(() => {
    const seen = new Set();
    return spaces
      .map((s) => s.host.name)
      .filter((name) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .sort();
  }, [spaces]);

  // Filtered + sorted spaces
  const filteredSpaces = useMemo(() => {
    let result = [...spaces];

    if (hostFilter !== "all") {
      result = result.filter((s) => s.host.name === hostFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    return sortSpacesByStatus(result);
  }, [spaces, hostFilter, statusFilter]);

  // Summary counts
  const counts = useMemo(() => {
    const c = { live: 0, scheduled: 0, ended: 0 };
    spaces.forEach((s) => {
      if (c[s.status] !== undefined) c[s.status]++;
    });
    return c;
  }, [spaces]);

  return (
    <PageShell>
      <PageHeader
        icon={AudioWaveform}
        title="Spaces Oversight"
        subtitle="Monitor and manage all live and scheduled community spaces"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSpaces}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p
                  className={cn(
                    poppins_500.className,
                    "text-xs uppercase tracking-wider text-muted-foreground"
                  )}
                >
                  Live Now
                </p>
                <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                  {loading ? "—" : counts.live}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-green-100 to-green-50">
                <Radio className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p
                  className={cn(
                    poppins_500.className,
                    "text-xs uppercase tracking-wider text-muted-foreground"
                  )}
                >
                  Scheduled
                </p>
                <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                  {loading ? "—" : counts.scheduled}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-blue-100 to-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p
                  className={cn(
                    poppins_500.className,
                    "text-xs uppercase tracking-wider text-muted-foreground"
                  )}
                >
                  Ended
                </p>
                <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                  {loading ? "—" : counts.ended}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-muted to-muted/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(poppins_500.className, "text-sm text-muted-foreground")}
              >
                Filters:
              </span>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="status-filter"
                className={cn(poppins_500.className, "text-xs text-muted-foreground")}
              >
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="host-filter"
                className={cn(poppins_500.className, "text-xs text-muted-foreground")}
              >
                Host
              </label>
              <Select value={hostFilter} onValueChange={setHostFilter}>
                <SelectTrigger id="host-filter" className="w-[200px]">
                  <SelectValue placeholder="All Hosts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hosts</SelectItem>
                  {hosts.map((host) => (
                    <SelectItem key={host} value={host}>
                      {host}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(hostFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHostFilter("all");
                  setStatusFilter("all");
                }}
                className="ml-auto"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spaces Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="h-5 w-5" />
            Community Spaces
          </CardTitle>
          <CardDescription>
            {filteredSpaces.length} space
            {filteredSpaces.length !== 1 && "s"} · Live rooms shown first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredSpaces.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No spaces found"
              description={
                hostFilter !== "all" || statusFilter !== "all"
                  ? "No spaces match your current filters. Try adjusting the filters."
                  : "No community spaces have been created yet."
              }
            />
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Title</TableHead>
                    <TableHead className="w-[160px]">Host</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[180px]">Scheduled Time</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Participants
                    </TableHead>
                    <TableHead className="w-[80px] text-center">Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpaces.map((space) => {
                    const statusConfig = STATUS_CONFIG[space.status];
                    return (
                      <TableRow
                        key={space.id}
                        className={cn(
                          space.status === "live" && "bg-green-50/50 dark:bg-green-950/10"
                        )}
                      >
                        {/* Title */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <StatusDot status={space.status} />
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  poppins_500.className,
                                  "text-sm font-medium truncate"
                                )}
                              >
                                {space.title}
                              </p>
                              {space.status === "scheduled" && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatRelativeTime(space.scheduledTime)}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Host */}
                        <TableCell>
                          <span className="text-sm">{space.host.name}</span>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Video className="h-3 w-3" />
                            Jitsi
                          </Badge>
                        </TableCell>

                        {/* Scheduled Time */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {formatScheduledTime(space.scheduledTime)}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            className={cn("text-xs", statusConfig.badge)}
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>

                        {/* Participant Count */}
                        <TableCell className="text-right">
                          {space.participantCount !== null ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm tabular-nums">
                                {space.participantCount}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Flags */}
                        <TableCell className="text-center">
                          {space.flags.includes("flagged") ? (
                            <div className="flex items-center justify-center">
                              <Flag
                                className="h-4 w-4 text-amber-500"
                                aria-label="Flagged"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
