"use client";
/**
 * Admin refunds register (#282) — status-tracked refund monitoring.
 * ---------------------------------------------------------------------------
 * Central view of every refund request with its state-machine status
 * (requested → processing → completed/failed), the initiator, buyer, a link to
 * the original transaction, the amount and completion timestamp. Admins can
 * filter by status / initiator / requested-date range, retry a failed refund
 * behind a confirmation dialog, and expand any row to read its full audit note
 * trail.
 *
 * Layering mirrors the admin-team / reconciliation pages: a stubbed service
 * (`lib/actions/admin-refunds`) → a data hook (`useRefunds`) → this page,
 * wrapped in `AdminTierGuard` (super-admin only).
 */
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Cpu,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  User,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useRefunds from "@/hooks/useRefunds";
import { REFUND_STATUSES } from "@/lib/actions/admin-refunds";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/** Visual + copy config per refund status. */
const STATUS_META = {
  requested: {
    label: "Requested",
    icon: Clock,
    badge: "bg-accent/10 text-accent border-accent/20",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge: "bg-secondary/10 text-secondary border-secondary/20",
  },
  failed: {
    label: "Failed",
    icon: ShieldAlert,
    badge: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const INITIATOR_META = {
  admin: { label: "Admin", icon: User },
  system: { label: "System", icon: Cpu },
};

/** Format a numeric amount with its currency, e.g. `40 USDC`. */
function amountLabel(amount, currency) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7,
  })} ${currency || ""}`.trim();
}

/** Format an ISO timestamp for a table cell; tolerant of bad input. */
function dateLabel(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMM yyyy, HH:mm");
}

/** One summary count chip. */
function SummaryStat({ label, value, className }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1", poppins_500.className, className)}
    >
      <span className="tabular-nums">{value}</span>
      <span className={cn(poppins_400.className, "ml-1 opacity-80")}>{label}</span>
    </Badge>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.requested;
  const StatusIcon = meta.icon;
  return (
    <Badge variant="outline" className={cn("rounded-full", meta.badge)}>
      <StatusIcon
        className={cn("h-3 w-3", status === "processing" && "animate-spin")}
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  );
}

function InitiatorLabel({ initiatedBy }) {
  const type = initiatedBy?.type === "system" ? "system" : "admin";
  const meta = INITIATOR_META[type];
  const InitiatorIcon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <InitiatorIcon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
      <span className={cn(poppins_500.className, "text-sm text-ink")}>
        {initiatedBy?.label || meta.label}
      </span>
      <span className={cn(poppins_400.className, "text-xs text-ink-muted")}>
        ({meta.label})
      </span>
    </span>
  );
}

/** Confirmation dialog + trigger for retrying a failed refund. */
function RetryRefundDialog({ refund, onConfirm, isRetrying }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRetrying}
          className="rounded-full"
        >
          {isRetrying ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          )}
          Retry
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={poppins_600.className}>
            Retry this refund?
          </AlertDialogTitle>
          <AlertDialogDescription className={poppins_400.className}>
            This will re-submit refund{" "}
            <span className="font-medium">{refund.transaction?.reference}</span>{" "}
            for {amountLabel(refund.amount, refund.currency)} to{" "}
            {refund.buyer?.name}. The refund returns to the processing state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-accent text-white hover:bg-accent/90"
            onClick={() => onConfirm(refund.id)}
          >
            Retry refund
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Expanded audit-note trail for a refund. */
function AuditTrail({ audit }) {
  const entries = Array.isArray(audit) ? audit : [];
  if (entries.length === 0) {
    return (
      <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
        No audit history recorded for this refund.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {entries.map((entry, index) => (
        <li key={`${entry.at}-${index}`} className="flex gap-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className={cn(poppins_500.className, "text-sm text-ink")}>
              {entry.note}
            </p>
            <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              {entry.actor} · {dateLabel(entry.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function RefundRow({ refund, isExpanded, onToggle, onRetry, isRetrying }) {
  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggle(refund.id)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Hide audit trail" : "Show audit trail"
            }
            className="h-7 w-7 rounded-full p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <InitiatorLabel initiatedBy={refund.initiatedBy} />
        </TableCell>
        <TableCell className={cn(poppins_400.className, "text-sm text-ink")}>
          {refund.buyer?.name}
        </TableCell>
        <TableCell>
          <Link
            href={`/dashboard/purchases/${refund.transaction?.id}`}
            className={cn(
              poppins_500.className,
              "inline-flex items-center gap-1 text-sm text-accent underline-offset-2 hover:underline"
            )}
          >
            {refund.transaction?.reference}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </TableCell>
        <TableCell className={cn(poppins_500.className, "text-sm text-ink")}>
          <span className="tabular-nums">
            {amountLabel(refund.amount, refund.currency)}
          </span>
        </TableCell>
        <TableCell>
          <StatusBadge status={refund.status} />
        </TableCell>
        <TableCell className={cn(poppins_400.className, "text-sm text-ink-muted")}>
          {refund.status === "completed" ? dateLabel(refund.completedAt) : "—"}
        </TableCell>
        <TableCell className="text-right">
          {refund.status === "failed" ? (
            <RetryRefundDialog
              refund={refund}
              onConfirm={onRetry}
              isRetrying={isRetrying}
            />
          ) : (
            <span className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              —
            </span>
          )}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-surface hover:bg-surface">
          <TableCell colSpan={8} className="py-4">
            <div className="rounded-xl border border-accent/10 bg-surface-raised p-4">
              <p
                className={cn(
                  poppins_600.className,
                  "mb-3 text-xs uppercase tracking-wide text-ink-muted"
                )}
              >
                Audit trail
              </p>
              <AuditTrail audit={refund.audit} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function LoadingRows() {
  return [...Array(4)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={8} className="py-3">
        <Skeleton className="h-8 w-full rounded-full opacity-30" />
      </TableCell>
    </TableRow>
  ));
}

function RefundsTable({ refunds, isLoading, expandedId, onToggle, onRetry, retryingId }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Initiated by</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? LoadingRows()
            : refunds.map((refund) => (
                <RefundRow
                  key={refund.id}
                  refund={refund}
                  isExpanded={expandedId === refund.id}
                  onToggle={onToggle}
                  onRetry={onRetry}
                  isRetrying={retryingId === refund.id}
                />
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RefundsContent() {
  const {
    refunds,
    summary,
    isLoading,
    error,
    retryingId,
    status,
    setStatus,
    initiator,
    setInitiator,
    from,
    setFrom,
    to,
    setTo,
    resetFilters,
    refresh,
    retry,
  } = useRefunds();

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpanded = (id) =>
    setExpandedId((current) => (current === id ? null : id));

  const hasActiveFilters =
    status !== "all" || initiator !== "all" || from !== "" || to !== "";
  const showTable = isLoading || refunds.length > 0;

  return (
    <PageShell>
      <PageHeader
        icon={Wallet}
        title="Refunds register"
        subtitle="Track every refund request, its status and audit trail — retry failed refunds from one place"
      />

      {/* Summary counts */}
      {!isLoading && !error && (
        <div className="flex flex-wrap items-center gap-2">
          <SummaryStat
            label="requested"
            value={summary.requested}
            className="bg-accent/10 text-accent border-accent/20"
          />
          <SummaryStat
            label="processing"
            value={summary.processing}
            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
          />
          <SummaryStat
            label="completed"
            value={summary.completed}
            className="bg-secondary/10 text-secondary border-secondary/20"
          />
          <SummaryStat
            label="failed"
            value={summary.failed}
            className="bg-destructive/10 text-destructive border-destructive/20"
          />
          <SummaryStat
            label="total"
            value={summary.total}
            className="bg-ink/5 text-ink border-ink/10"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="refund-status" className={poppins_500.className}>
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="refund-status" className="w-[11rem]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {REFUND_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s]?.label || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="refund-initiator" className={poppins_500.className}>
            Initiated by
          </Label>
          <Select value={initiator} onValueChange={setInitiator}>
            <SelectTrigger id="refund-initiator" className="w-[11rem]">
              <SelectValue placeholder="All initiators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All initiators</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="refund-from" className={poppins_500.className}>
            Requested from
          </Label>
          <Input
            id="refund-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="w-[11rem]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="refund-to" className={poppins_500.className}>
            Requested to
          </Label>
          <Input
            id="refund-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="w-[11rem]"
          />
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
            className="rounded-full"
          >
            Clear filters
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
          disabled={isLoading}
          className="ml-auto rounded-full"
        >
          <RefreshCw
            className={cn("mr-1 h-4 w-4", isLoading && "animate-spin")}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {/* Results */}
      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn’t load refunds"
          description={error}
          action={
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={refresh}
            >
              Try again
            </Button>
          }
        />
      ) : showTable ? (
        <RefundsTable
          refunds={refunds}
          isLoading={isLoading}
          expandedId={expandedId}
          onToggle={toggleExpanded}
          onRetry={retry}
          retryingId={retryingId}
        />
      ) : hasActiveFilters ? (
        <EmptyState
          icon={Wallet}
          title="No refunds match these filters"
          description="Try clearing or widening the status, initiator or date filters."
          action={
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={resetFilters}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No refunds yet"
          description="Refund requests will appear here as buyers and admins raise them."
        />
      )}
    </PageShell>
  );
}

export default function RefundsPage() {
  return (
    <AdminTierGuard>
      <RefundsContent />
    </AdminTierGuard>
  );
}
