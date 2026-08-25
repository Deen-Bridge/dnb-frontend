"use client";
/**
 * Admin audit-log viewer (#308).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) that renders the audit
 * trail of privileged admin actions with actor / category / date-range filters
 * and **server-side** pagination. Rows are produced by the shared
 * `logAdminAction()` helper (see `lib/actions/admin-audit`) that every mutating
 * admin flow calls; this page is the read side of that trail.
 *
 * Mirrors the structure/styling of the admin-team page (#315).
 */
import Link from "next/link";
import { ScrollText, ExternalLink, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
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
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useAuditLogs from "@/hooks/useAuditLogs";
import { AUDIT_CATEGORIES } from "@/lib/actions/admin-audit";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

const PAGE_SIZE = 20;

const categoryBadge = {
  user: "bg-accent/10 text-accent border-accent/20",
  course: "bg-secondary/10 text-secondary border-secondary/20",
  payment: "bg-highlight/10 text-highlight border-highlight/20",
  moderation: "bg-destructive/10 text-destructive border-destructive/20",
  system: "bg-ink/10 text-ink border-ink/20",
};

/** Format an ISO timestamp for the Timestamp column; guards invalid dates. */
function formatTimestamp(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return format(date, "d MMM yyyy, HH:mm");
}

function FilterControls({ filters, actors, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      {/* Actor filter */}
      <div className="space-y-1.5">
        <Label
          htmlFor="audit-actor"
          className={cn(poppins_500.className, "text-ink")}
        >
          Admin actor
        </Label>
        <Select
          value={filters.actor}
          onValueChange={(value) => onChange({ actor: value })}
        >
          <SelectTrigger id="audit-actor" className="w-full" aria-label="Filter by admin actor">
            <SelectValue placeholder="All actors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            {actors.map((actor) => (
              <SelectItem key={actor.id} value={actor.id}>
                {actor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category filter */}
      <div className="space-y-1.5">
        <Label
          htmlFor="audit-category"
          className={cn(poppins_500.className, "text-ink")}
        >
          Action category
        </Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onChange({ category: value })}
        >
          <SelectTrigger id="audit-category" className="w-full" aria-label="Filter by action category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {AUDIT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category} className="capitalize">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* From date */}
      <div className="space-y-1.5">
        <Label htmlFor="audit-from" className={cn(poppins_500.className, "text-ink")}>
          From
        </Label>
        <Input
          id="audit-from"
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          aria-label="Filter from date"
        />
      </div>

      {/* To date */}
      <div className="space-y-1.5">
        <Label htmlFor="audit-to" className={cn(poppins_500.className, "text-ink")}>
          To
        </Label>
        <Input
          id="audit-to"
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          aria-label="Filter to date"
        />
      </div>
    </div>
  );
}

function LoadingRows() {
  return [...Array(6)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={6} className="py-3">
        <Skeleton className="h-8 w-full rounded-full" />
      </TableCell>
    </TableRow>
  ));
}

function LogRow({ log }) {
  return (
    <TableRow>
      <TableCell
        className={cn(poppins_400.className, "whitespace-nowrap text-sm text-ink-muted")}
      >
        {formatTimestamp(log.timestamp)}
      </TableCell>
      <TableCell className={cn(poppins_500.className, "text-sm text-ink")}>
        {log.actor?.name || "—"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <code
            className={cn(
              poppins_400.className,
              "w-fit rounded bg-accent/5 px-1.5 py-0.5 text-xs text-ink"
            )}
          >
            {log.action}
          </code>
          <Badge
            variant="outline"
            className={cn("w-fit rounded-full capitalize", categoryBadge[log.category])}
          >
            {log.category}
          </Badge>
        </div>
      </TableCell>
      <TableCell className={cn(poppins_400.className, "text-sm")}>
        {log.target?.href ? (
          <Link
            href={log.target.href}
            className="inline-flex items-center gap-1 text-accent underline-offset-2 hover:underline"
          >
            {log.target.label}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-ink-muted">{log.target?.label || "—"}</span>
        )}
      </TableCell>
      <TableCell
        className={cn(poppins_400.className, "max-w-xs text-sm text-ink-muted")}
      >
        {log.summary || "—"}
      </TableCell>
      <TableCell
        className={cn(poppins_400.className, "whitespace-nowrap text-sm text-ink-muted")}
      >
        {log.ip || "—"}
      </TableCell>
    </TableRow>
  );
}

function AuditTableHead() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Timestamp</TableHead>
        <TableHead>Admin actor</TableHead>
        <TableHead>Action type</TableHead>
        <TableHead>Target</TableHead>
        <TableHead>Summary</TableHead>
        <TableHead>IP address</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function AuditLogsContent() {
  const {
    logs,
    total,
    page,
    pageSize,
    filters,
    actors,
    isLoading,
    error,
    setFilters,
    setPage,
    refresh,
  } = useAuditLogs({ pageSize: PAGE_SIZE });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <PageShell>
      <PageHeader
        icon={ScrollText}
        title="Audit logs"
        subtitle="Review privileged admin actions across DeenBridge"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => refresh()}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <FilterControls filters={filters} actors={actors} onChange={setFilters} />

      {error ? (
        <EmptyState
          icon={ScrollText}
          title="Failed to load"
          description={error}
          action={
            <Button type="button" variant="outline" className="rounded-full" onClick={() => refresh()}>
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="overflow-x-auto rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <Table>
            <AuditTableHead />
            <TableBody>{LoadingRows()}</TableBody>
          </Table>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries"
          description="No admin actions match these filters. Adjust the filters or check back later."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
            <Table>
              <AuditTableHead />
              <TableBody>
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Server-side pagination controls */}
          <div className="flex items-center justify-between gap-4">
            <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
              Page {page} of {totalPages}
              <span className="hidden sm:inline"> · {total} total entries</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={!canPrev}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={!canNext}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

export default function AuditLogsPage() {
  return (
    <AdminTierGuard>
      <AuditLogsContent />
    </AdminTierGuard>
  );
}
