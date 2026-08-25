"use client";
/**
 * Admin payout reconciliation page (#285) — READ-ONLY diagnostic.
 * ---------------------------------------------------------------------------
 * Reconciles internal COMPLETED platform purchases against on-chain creator
 * settlement claims for a chosen date range, so an admin can spot discrepancies
 * (never settled, or settled for the wrong amount) at a glance. The whole tool
 * is strictly read-only: it renders a date range picker, a summary of counts,
 * and a table where mismatched / missing rows are highlighted and linked to
 * both the platform record and the on-chain explorer. Nothing here mutates
 * state.
 *
 * Layering mirrors the admin-team page: a stubbed service
 * (`lib/actions/admin-reconciliation`) → a data hook (`useReconciliation`) →
 * this page, wrapped in `AdminTierGuard` (super-admin only).
 */
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Scale,
  SearchX,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import useReconciliation from "@/hooks/useReconciliation";
import { explorerTxUrl } from "@/lib/actions/admin-reconciliation";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/** Visual + copy config per reconciliation status. */
const STATUS_META = {
  matched: {
    label: "Matched",
    icon: CheckCircle2,
    badge: "bg-secondary/10 text-secondary border-secondary/20",
    rowClass: "",
    highlighted: false,
  },
  "missing-on-chain": {
    label: "Missing on-chain",
    icon: SearchX,
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    rowClass: "bg-destructive/5 hover:bg-destructive/10",
    highlighted: true,
  },
  "amount-mismatch": {
    label: "Amount mismatch",
    icon: AlertTriangle,
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rowClass: "bg-amber-500/5 hover:bg-amber-500/10",
    highlighted: true,
  },
};

/** Format a numeric amount with its currency, e.g. `25 USDC`. */
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

function LoadingRows() {
  return [...Array(4)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={6} className="py-3">
        <Skeleton className="h-8 w-full rounded-full opacity-30" />
      </TableCell>
    </TableRow>
  ));
}

function ReconciliationRow({ row }) {
  const meta = STATUS_META[row.status] || STATUS_META.matched;
  const StatusIcon = meta.icon;
  const explorerUrl = explorerTxUrl(row.txHash);

  // On a mismatch the on-chain amount is the interesting counter-value.
  const onChainAmount =
    row.status === "amount-mismatch" && row.onChain
      ? amountLabel(row.onChain.amount, row.onChain.currency)
      : null;

  return (
    <TableRow id={`tx-${row.id}`} className={meta.rowClass}>
      <TableCell>
        <Link
          href={`/dashboard/purchases/${row.id}`}
          className={cn(
            poppins_500.className,
            "inline-flex items-center gap-1 text-sm text-accent underline-offset-2 hover:underline"
          )}
        >
          {row.reference}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </TableCell>
      <TableCell className={cn(poppins_400.className, "text-sm text-ink")}>
        {row.buyer}
      </TableCell>
      <TableCell className={cn(poppins_400.className, "text-sm text-ink")}>
        {row.creator}
      </TableCell>
      <TableCell className={cn(poppins_500.className, "text-sm text-ink")}>
        <span className="tabular-nums">{amountLabel(row.amount, row.currency)}</span>
        {onChainAmount && (
          <span
            className={cn(
              poppins_400.className,
              "block text-xs text-amber-600 tabular-nums"
            )}
          >
            on-chain: {onChainAmount}
          </span>
        )}
      </TableCell>
      <TableCell className={cn(poppins_400.className, "text-sm text-ink-muted")}>
        {dateLabel(row.completedAt)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1.5">
          <Badge
            variant="outline"
            className={cn("rounded-full", meta.badge)}
          >
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            {meta.label}
          </Badge>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                poppins_400.className,
                "inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
              )}
            >
              View on-chain
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function ReconciliationTable({ rows, isLoading }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? LoadingRows()
            : rows.map((row) => <ReconciliationRow key={row.id} row={row} />)}
        </TableBody>
      </Table>
    </div>
  );
}

function ReconciliationContent() {
  const {
    rows,
    summary,
    isLoading,
    error,
    hasRun,
    from,
    to,
    setRange,
    run,
  } = useReconciliation();

  const handleSubmit = (event) => {
    event.preventDefault();
    run();
  };

  const showTable = isLoading || (hasRun && rows.length > 0);

  return (
    <PageShell>
      <PageHeader
        icon={Scale}
        title="Payout reconciliation"
        subtitle="Cross-check completed platform purchases against on-chain settlement claims for a period"
      />

      {/* Read-only date range picker */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="reconcile-from" className={poppins_500.className}>
            From
          </Label>
          <Input
            id="reconcile-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setRange({ from: event.target.value })}
            className="w-[11rem]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reconcile-to" className={poppins_500.className}>
            To
          </Label>
          <Input
            id="reconcile-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setRange({ to: event.target.value })}
            className="w-[11rem]"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !from || !to}
          className="rounded-full bg-accent text-white hover:bg-accent/90"
        >
          <Scale className="mr-1 h-4 w-4" aria-hidden="true" />
          {isLoading ? "Reconciling…" : "Reconcile"}
        </Button>
      </form>

      {/* Summary counts */}
      {hasRun && !error && (
        <div className="flex flex-wrap items-center gap-2">
          <SummaryStat
            label="matched"
            value={summary.matched}
            className="bg-secondary/10 text-secondary border-secondary/20"
          />
          <SummaryStat
            label="missing on-chain"
            value={summary.missing}
            className="bg-destructive/10 text-destructive border-destructive/20"
          />
          <SummaryStat
            label="amount mismatch"
            value={summary.mismatch}
            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
          />
          <SummaryStat
            label="total"
            value={summary.total}
            className="bg-accent/10 text-accent border-accent/20"
          />
        </div>
      )}

      {/* Results */}
      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn’t reconcile"
          description={error}
          action={
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => run()}
              disabled={!from || !to}
            >
              Try again
            </Button>
          }
        />
      ) : showTable ? (
        <ReconciliationTable rows={rows} isLoading={isLoading} />
      ) : hasRun ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing to reconcile"
          description="No completed transactions were found in this date range."
        />
      ) : (
        <EmptyState
          icon={Scale}
          title="Pick a date range to begin"
          description="Choose a start and end date, then run the reconciliation to compare platform records against on-chain settlements."
        />
      )}
    </PageShell>
  );
}

export default function ReconciliationPage() {
  return (
    <AdminTierGuard>
      <ReconciliationContent />
    </AdminTierGuard>
  );
}
