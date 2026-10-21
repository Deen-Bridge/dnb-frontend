"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  TimerReset,
  UserCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  VERIFICATION_SLA_BUCKET_ORDER,
  VERIFICATION_SLA_BUCKETS,
  countVerificationSlaBuckets,
  getVerificationAgeDays,
  getVerificationSlaBucket,
} from "@/lib/admin/verification-sla";
import {
  REJECTION_REASON_CATEGORIES,
  approveVerification,
  fetchVerificationQueue,
  rejectVerification,
} from "@/lib/actions/admin-verifications";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import { AdminEmptyState } from "@/components/molecules/admin/empty-state";

const SLA_ICONS = {
  healthy: CheckCircle2,
  watch: Clock3,
  overdue: AlertTriangle,
};

const OPEN_STATUSES = ["pending", "under_review"];

const STATUS_LABELS = {
  pending: "Pending",
  under_review: "Under review",
};

function normalizeApplication(app) {
  const subjects = Array.isArray(app.subjects) ? app.subjects : [];
  return {
    id: app.id,
    educator: app.name || "Unknown",
    email: app.email || "",
    submittedAt: app.submittedAt,
    documents: Array.isArray(app.documents) ? app.documents.length : 0,
    status: app.status,
    track: subjects.length > 0 ? subjects.join(", ") : "General",
  };
}

function formatSubmittedAt(timestamp) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AgeBadge({ submittedAt, now }) {
  const ageDays = getVerificationAgeDays(submittedAt, now);
  const bucket = getVerificationSlaBucket(submittedAt, now);

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap text-xs", bucket.badgeClass)}
    >
      <span
        className={cn("h-2 w-2 rounded-full", bucket.dotClass)}
        aria-hidden="true"
      />
      {ageDays === 0 ? "Today" : `${ageDays}d old`}
    </Badge>
  );
}

function SlaSummaryStrip({ queue, now }) {
  const counts = useMemo(
    () => countVerificationSlaBuckets(queue, now),
    [queue, now]
  );

  return (
    <div className="grid gap-3 md:grid-cols-3" aria-label="SLA backlog summary">
      {VERIFICATION_SLA_BUCKET_ORDER.map((key) => {
        const bucket = VERIFICATION_SLA_BUCKETS[key];
        const Icon = SLA_ICONS[key];

        return (
          <div
            key={bucket.key}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{bucket.shortLabel}</p>
                <p className="text-xs text-muted-foreground">{bucket.label}</p>
              </div>
              <span className={cn("rounded-full p-2", bucket.badgeClass)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold">{counts[bucket.key]}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminVerificationQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reasons, setReasons] = useState({});
  const [bucketFilter, setBucketFilter] = useState("all");
  const [search, setSearch] = useState("");
  const now = useMemo(() => new Date(), []);

  const filteredQueue = useMemo(() => {
    const term = search.trim().toLowerCase();

    return queue.filter((item) => {
      const bucket = getVerificationSlaBucket(item.submittedAt, now);
      const matchesBucket = bucketFilter === "all" || bucket.key === bucketFilter;
      const matchesSearch =
        !term ||
        item.educator.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.track.toLowerCase().includes(term);

      return matchesBucket && matchesSearch;
    });
  }, [bucketFilter, now, queue, search]);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVerificationQueue({ limit: 100 });
      setQueue(
        (data?.applications ?? [])
          .filter((app) => OPEN_STATUSES.includes(app.status))
          .map(normalizeApplication)
      );
    } catch (err) {
      setError(err?.message || "Failed to load the verification queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const refreshQueue = loadQueue;

  const decide = async (item, decision) => {
    setBusyId(item.id);
    try {
      if (decision === "approve") {
        await approveVerification(item.id);
      } else {
        await rejectVerification(item.id, { reasonCategory: reasons[item.id] });
      }
      setQueue((prev) => prev.filter((entry) => entry.id !== item.id));
      toast.success(
        decision === "approve" ? "Application approved" : "Application rejected"
      );
    } catch (err) {
      toast.error(err?.message || "Could not record the decision.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={ShieldCheck}
        title="Verification Queue"
        subtitle="Prioritize educator applications by SLA age"
        actions={
          <Button variant="outline" size="sm" onClick={refreshQueue} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <SlaSummaryStrip queue={queue} now={now} />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Educator applications</CardTitle>
              <CardDescription>
                {filteredQueue.length} application
                {filteredQueue.length === 1 ? "" : "s"} in the current view
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Tabs value={bucketFilter} onValueChange={setBucketFilter}>
                <TabsList aria-label="Filter applications by SLA bucket">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {VERIFICATION_SLA_BUCKET_ORDER.map((key) => (
                    <TabsTrigger key={key} value={key}>
                      {VERIFICATION_SLA_BUCKETS[key].shortLabel}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <label className="relative block">
                <span className="sr-only">Search verification queue</span>
                <Search
                  className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search educators"
                  className="h-9 w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm sm:w-56"
                />
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Educator</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>SLA age</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                      role="status"
                    >
                      <Loader2
                        className="mx-auto mb-2 h-6 w-6 animate-spin"
                        aria-hidden="true"
                      />
                      <p>Loading verification queue...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-destructive"
                      role="alert"
                    >
                      <p>{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={refreshQueue}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : filteredQueue.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <UserCheck
                        className="mx-auto mb-2 h-8 w-8 opacity-50"
                        aria-hidden="true"
                      />
                      <p>No verification applications match this view.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredQueue.length === 0 ? (
                  <AdminEmptyState
                    colSpan={7}
                    icon={UserCheck}
                    title="No verification applications"
                    description="There are no applications that match the selected view."
                  />
                ) : (
                  filteredQueue.map((item) => {
                    const bucket = getVerificationSlaBucket(item.submittedAt, now);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {item.educator.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/verification/${item.id}`}
                                className={cn(poppins_500.className, "text-sm hover:underline")}
                              >
                                {item.educator}
                              </Link>
                              <p className="truncate text-xs text-muted-foreground">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatSubmittedAt(item.submittedAt)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.submittedAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AgeBadge submittedAt={item.submittedAt} now={now} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.track}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            {item.documents}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 text-sm">
                            <TimerReset
                              className={cn("h-4 w-4", bucket.iconClass)}
                              aria-hidden="true"
                            />
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              disabled={busyId === item.id}
                              onClick={() => decide(item, "approve")}
                            >
                              Approve
                            </Button>
                            <select
                              aria-label={`Rejection reason for ${item.educator}`}
                              value={reasons[item.id] || ""}
                              onChange={(event) =>
                                setReasons((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value,
                                }))
                              }
                              className="h-8 rounded-md border bg-background px-2 text-xs"
                            >
                              <option value="">Reason...</option>
                              {REJECTION_REASON_CATEGORIES.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === item.id || !reasons[item.id]}
                              onClick={() => decide(item, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <p className={cn(poppins_400.className, "mt-3 text-xs text-muted-foreground")}>
            Green means under 3 days, amber means 3-7 days, and red means beyond
            7 days.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
