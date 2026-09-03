"use client";
/**
 * Admin moderation-reports page (#289).
 * ---------------------------------------------------------------------------
 * The moderation queue: a dense list of open/escalated reports, each row a
 * one-line summary (reason, target, reporter, serial-reporter flag, age).
 * Selecting a row opens the full-context `ReportDetailDrawer` — inline content
 * preview, reporter trust signals, target history, and an action rail — so a
 * moderator can act without leaving the page.
 *
 * Super-admin only (wrapped in `AdminTierGuard`). All data/actions flow through
 * the `useReports` hook over the stubbed `lib/actions/admin-reports` service.
 */
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flag, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import ReportDetailDrawer from "@/components/admin/reports/ReportDetailDrawer";
import useReports from "@/hooks/useReports";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

const SERIAL_REPORTER_THRESHOLD = 5;

const TARGET_TYPE_LABEL = { reel: "Reel", book: "Book", course: "Course" };

function StatusBadge({ status }) {
  const variant =
    status === "escalated" ? "destructive" : status === "open" ? "default" : "secondary";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return <Badge variant={variant}>{label}</Badge>;
}

function ReportsContent() {
  const reports = useReports();
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selected = useMemo(
    () => reports.reports.find((r) => r.id === selectedId) || null,
    [reports.reports, selectedId]
  );

  const openReport = (id) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  return (
    <PageShell>
      <PageHeader
        title="Moderation reports"
        subtitle="Review flagged content with full context, then escalate, dismiss, or act on the target."
      />

      {reports.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : reports.reports.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Queue is clear"
          description="There are no open reports to review right now."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Filed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.reports.map((r) => {
                const serial = (r.reporter?.priorReportCount || 0) >= SERIAL_REPORTER_THRESHOLD;
                return (
                  <TableRow
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open report ${r.id}: ${r.reason}`}
                    className="cursor-pointer"
                    onClick={() => openReport(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openReport(r.id);
                      }
                    }}
                  >
                    <TableCell>
                      <span className={cn(poppins_500.className, "flex items-center gap-2 text-ink")}>
                        <Flag className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                        {r.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(poppins_400.className, "flex items-center gap-2")}>
                        <Badge variant="secondary">{TARGET_TYPE_LABEL[r.target?.type] || "Content"}</Badge>
                        <span className="max-w-[16rem] truncate text-ink-muted">{r.target?.title}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(poppins_400.className, "flex items-center gap-2 text-ink-muted")}>
                        {r.reporter?.name}
                        {serial ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                            {r.reporter.priorReportCount}
                          </Badge>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className={cn(poppins_400.className, "text-ink-muted")}>
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ReportDetailDrawer
        report={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        reports={reports}
      />
    </PageShell>
  );
}

export default function ReportsPage() {
  return (
    <AdminTierGuard>
      <ReportsContent />
    </AdminTierGuard>
  );
}
