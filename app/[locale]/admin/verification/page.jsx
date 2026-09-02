"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

const SLA_ICONS = {
  healthy: CheckCircle2,
  watch: Clock3,
  overdue: AlertTriangle,
};

const mockVerificationQueue = [
  {
    id: "evq_101",
    educator: "Amina Yusuf",
    email: "amina.yusuf@example.com",
    submittedAt: "2026-08-27T08:30:00Z",
    documents: 3,
    status: "Under review",
    track: "Quran Studies",
  },
  {
    id: "evq_102",
    educator: "Bilal Kareem",
    email: "bilal.kareem@example.com",
    submittedAt: "2026-08-25T11:15:00Z",
    documents: 2,
    status: "Pending document check",
    track: "Arabic",
  },
  {
    id: "evq_103",
    educator: "Maryam Bello",
    email: "maryam.bello@example.com",
    submittedAt: "2026-08-23T09:45:00Z",
    documents: 4,
    status: "Liveness review",
    track: "Hadith",
  },
  {
    id: "evq_104",
    educator: "Ibrahim Sani",
    email: "ibrahim.sani@example.com",
    submittedAt: "2026-08-20T14:00:00Z",
    documents: 3,
    status: "Admin review",
    track: "Fiqh",
  },
  {
    id: "evq_105",
    educator: "Khadija Noor",
    email: "khadija.noor@example.com",
    submittedAt: "2026-08-18T07:20:00Z",
    documents: 2,
    status: "Needs escalation",
    track: "Seerah",
  },
  {
    id: "evq_106",
    educator: "Omar Ali",
    email: "omar.ali@example.com",
    submittedAt: "2026-08-16T15:10:00Z",
    documents: 5,
    status: "Needs escalation",
    track: "Islamic Finance",
  },
];

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
  const [queue, setQueue] = useState(mockVerificationQueue);
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

  const refreshQueue = () => {
    setQueue([...mockVerificationQueue]);
  };

  return (
    <PageShell>
      <PageHeader
        icon={ShieldCheck}
        title="Verification Queue"
        subtitle="Prioritize educator applications by SLA age"
        actions={
          <Button variant="outline" size="sm" onClick={refreshQueue}>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <UserCheck
                        className="mx-auto mb-2 h-8 w-8 opacity-50"
                        aria-hidden="true"
                      />
                      <p>No verification applications match this view.</p>
                    </TableCell>
                  </TableRow>
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
                              <p className={cn(poppins_500.className, "text-sm")}>
                                {item.educator}
                              </p>
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
                            {item.status}
                          </span>
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
