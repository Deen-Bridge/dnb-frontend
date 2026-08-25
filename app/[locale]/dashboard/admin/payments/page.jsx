"use client";
/**
 * Admin payments — refund initiation flow (#281).
 * ---------------------------------------------------------------------------
 * Self-contained page for admins to initiate refunds on eligible purchases.
 * Uses mock data throughout. The real backend contract is documented via
 * TODO(backend) comments so the page is easy to wire up when the API lands.
 *
 * Features:
 *   - Eligibility check display (policy window, consumption limits)
 *   - Amount field defaulting to full price with partial-refund option
 *   - Typed confirmation dialog showing buyer wallet address
 *   - Reflects actual backend job status (no optimistic UI)
 *   - Clear error handling with loud failure messages
 */
import { useState, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import { refundPayment } from "@/lib/actions/admin-payments";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { cn } from "@/lib/utils";

/* ── Mock data ────────────────────────────────────────────────────────────── */

const POLICY_WINDOW_DAYS = 14;
const MAX_CONSUMPTION_PCT = 20;

const MOCK_PURCHASES = [
  {
    id: "ord_7f3a1c",
    courseTitle: "Stellar Smart Contracts 101",
    buyer: "rGx9…mK4p",
    buyerWallet: "rGx9Pq2wLmK4pN7vT8yH3jF6sA1dR5cB0e",
    creator: "acct_xK29",
    amount: 49.99,
    currency: "USDC",
    purchasedAt: "2026-08-10T14:23:00Z",
    consumptionPct: 5,
    status: "completed",
    refundStatus: null,
  },
  {
    id: "ord_9b2d4e",
    courseTitle: "DeFi Yield Strategies",
    buyer: "rHq3…nL8v",
    buyerWallet: "rHq3Nk7wPmL8vT2yF6jS1dA5cR9eB0g",
    creator: "acct_mK30",
    amount: 129.0,
    currency: "USDC",
    purchasedAt: "2026-08-01T09:15:00Z",
    consumptionPct: 85,
    status: "completed",
    refundStatus: null,
  },
  {
    id: "ord_c4e8f1",
    courseTitle: "Building on Soroban",
    buyer: "rJk5…oP2t",
    buyerWallet: "rJk5Pq2tLoP2vN8yH3jF6sA1dR5cB0e",
    creator: "acct_pL31",
    amount: 75.5,
    currency: "USDC",
    purchasedAt: "2026-07-20T11:45:00Z",
    consumptionPct: 0,
    status: "completed",
    refundStatus: { status: "refunded", amount: 75.5 },
  },
  {
    id: "ord_d5f9a2",
    courseTitle: "Stellar Advanced Topics",
    buyer: "rMn7…qR4w",
    buyerWallet: "rMn7Pq4wRqR4vT2yF6jS1dA5cR9eB0g",
    creator: "acct_qM32",
    amount: 199.0,
    currency: "USDC",
    purchasedAt: "2026-08-24T08:00:00Z",
    consumptionPct: 0,
    status: "completed",
    refundStatus: null,
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function daysSince(iso) {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatAmount(n, currency) {
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function isoDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function checkEligibility(purchase) {
  if (purchase.refundStatus?.status === "refunded") {
    return { eligible: false, reason: "Already refunded" };
  }
  if (purchase.consumptionPct > MAX_CONSUMPTION_PCT) {
    return {
      eligible: false,
      reason: `Consumption exceeds ${MAX_CONSUMPTION_PCT}% limit (${purchase.consumptionPct}%)`,
    };
  }
  const days = daysSince(purchase.purchasedAt);
  if (days > POLICY_WINDOW_DAYS) {
    return {
      eligible: false,
      reason: `Purchase is ${days} days old (policy window: ${POLICY_WINDOW_DAYS} days)`,
    };
  }
  return { eligible: true, reason: null };
}

/* ── Refund Status Badge ──────────────────────────────────────────────────── */

function RefundStatusBadge({ refundStatus, jobStatus }) {
  if (jobStatus === "pending") {
    return (
      <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-600 border-amber-500/20">
        <Clock className="h-3 w-3" aria-hidden="true" />
        Processing
      </Badge>
    );
  }
  if (jobStatus === "failed") {
    return (
      <Badge variant="destructive" className="rounded-full">
        <XCircle className="h-3 w-3" aria-hidden="true" />
        Failed
      </Badge>
    );
  }
  if (refundStatus?.status === "refunded") {
    return (
      <Badge variant="outline" className="rounded-full bg-secondary/10 text-secondary border-secondary/20">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Refunded
      </Badge>
    );
  }
  return null;
}

/* ── Eligibility Indicator ────────────────────────────────────────────────── */

function EligibilityIndicator({ eligible, reason }) {
  if (eligible) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-secondary">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Eligible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {reason}
    </span>
  );
}

/* ── Purchase Row ─────────────────────────────────────────────────────────── */

function PurchaseRow({
  purchase,
  eligibility,
  onSelect,
  jobStatus,
  refundAmount,
}) {
  return (
    <tr className="border-b border-accent/10 last:border-0">
      <td className="py-3 pr-2">
        <p className={cn(poppins_500.className, "text-sm text-ink")}>
          {purchase.courseTitle}
        </p>
        <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
          {purchase.id}
        </p>
      </td>
      <td className="py-3 pr-2">
        <p className={cn(poppins_400.className, "text-sm text-ink")}>
          {purchase.buyer}
        </p>
      </td>
      <td className="py-3 pr-2">
        <p className={cn(poppins_500.className, "text-sm text-ink tabular-nums")}>
          {formatAmount(purchase.amount, purchase.currency)}
        </p>
      </td>
      <td className="py-3 pr-2">
        <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
          {isoDate(purchase.purchasedAt)}
        </p>
        <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
          {daysSince(purchase.purchasedAt)}d ago · {purchase.consumptionPct}% consumed
        </p>
      </td>
      <td className="py-3 pr-2">
        <RefundStatusBadge
          refundStatus={purchase.refundStatus}
          jobStatus={jobStatus}
        />
      </td>
      <td className="py-3">
        <div className="flex flex-col items-start gap-1">
          <EligibilityIndicator
            eligible={eligibility.eligible}
            reason={eligibility.reason}
          />
          {eligibility.eligible && !purchase.refundStatus && (
            <Button
              variant="outline"
              size="sm"
              className={cn(poppins_500.className, "rounded-full text-xs")}
              onClick={() => onSelect(purchase)}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Refund
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */

function PaymentsContent() {
  const [selected, setSelected] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [reason, setReason] = useState("");
  const [jobStatus, setJobStatus] = useState({}); // { [orderId]: "pending" | "done" | "failed" }
  const [confirmOpen, setConfirmOpen] = useState(false);

  const purchases = useMemo(
    () =>
      MOCK_PURCHASES.map((p) => ({
        ...p,
        eligibility: checkEligibility(p),
      })),
    []
  );

  const handleSelect = useCallback((purchase) => {
    setSelected(purchase);
    setRefundAmount(String(purchase.amount));
    setIsPartial(false);
    setReason("");
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selected) return;
    const amount = isPartial ? parseFloat(refundAmount) : selected.amount;

    if (isPartial && (isNaN(amount) || amount <= 0 || amount > selected.amount)) {
      toast.error("Invalid refund amount", {
        description: `Must be between 0.01 and ${formatAmount(selected.amount, selected.currency)}`,
      });
      return;
    }

    setConfirmOpen(false);
    setJobStatus((prev) => ({ ...prev, [selected.id]: "pending" }));

    try {
      await refundPayment(selected.id, { amount, reason });
      setJobStatus((prev) => ({ ...prev, [selected.id]: "done" }));
      toast.success("Refund initiated", {
        description: `${formatAmount(amount, selected.currency)} refund for ${selected.courseTitle} is processing.`,
      });
    } catch (err) {
      setJobStatus((prev) => ({ ...prev, [selected.id]: "failed" }));
      toast.error("Refund failed", {
        description: err?.message || "Could not initiate refund. Please try again.",
      });
    }

    setSelected(null);
    setRefundAmount("");
    setReason("");
  }, [selected, isPartial, refundAmount, reason]);

  const handleRetry = useCallback((purchase) => {
    handleSelect(purchase);
  }, [handleSelect]);

  return (
    <PageShell>
      <PageHeader
        icon={DollarSign}
        title="Payment refunds"
        subtitle={`Initiate refunds for eligible purchases (policy window: ${POLICY_WINDOW_DAYS} days, consumption limit: ${MAX_CONSUMPTION_PCT}%)`}
      />

      {/* Policy summary */}
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Refund policy</AlertTitle>
        <AlertDescription>
          Purchases are eligible for refund within {POLICY_WINDOW_DAYS} days and
          only if the buyer has consumed {MAX_CONSUMPTION_PCT}% or less of the
          course content. Partial refunds are supported. All refund actions are
          logged to the audit trail.
        </AlertDescription>
      </Alert>

      {/* Error banner for failed jobs */}
      {Object.entries(jobStatus).some(([, s]) => s === "failed") && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Refund failed</AlertTitle>
          <AlertDescription>
            One or more refund attempts failed. Check the status column below
            and retry if needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Purchase table */}
      <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-accent/10">
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-4 text-xs text-ink-muted uppercase tracking-wider")}>
                  Course
                </th>
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-2 text-xs text-ink-muted uppercase tracking-wider")}>
                  Buyer
                </th>
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-2 text-xs text-ink-muted uppercase tracking-wider")}>
                  Amount
                </th>
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-2 text-xs text-ink-muted uppercase tracking-wider")}>
                  Purchase date
                </th>
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-2 text-xs text-ink-muted uppercase tracking-wider")}>
                  Status
                </th>
                <th className={cn(poppins_500.className, "pb-3 pt-4 px-2 text-xs text-ink-muted uppercase tracking-wider")}>
                  Eligibility
                </th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <PurchaseRow
                  key={p.id}
                  purchase={p}
                  eligibility={p.eligibility}
                  onSelect={handleSelect}
                  jobStatus={jobStatus[p.id]}
                  refundAmount={refundAmount}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund details card */}
      {selected && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className={cn(poppins_600.className, "text-lg")}>
              Refund details
            </CardTitle>
            <CardDescription>
              Review the refund for <strong>{selected.courseTitle}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className={cn(poppins_500.className, "text-ink-muted")}>Buyer wallet</Label>
                <p className={cn(poppins_400.className, "mt-1 font-mono text-sm text-ink break-all")}>
                  {selected.buyerWallet}
                </p>
              </div>
              <div>
                <Label className={cn(poppins_500.className, "text-ink-muted")}>Original amount</Label>
                <p className={cn(poppins_500.className, "mt-1 text-sm text-ink tabular-nums")}>
                  {formatAmount(selected.amount, selected.currency)}
                </p>
              </div>
            </div>

            {/* Partial refund toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="partial-toggle"
                checked={isPartial}
                onChange={(e) => {
                  setIsPartial(e.target.checked);
                  if (!e.target.checked) setRefundAmount(String(selected.amount));
                }}
                className="h-4 w-4 rounded border-accent/30 text-accent focus:ring-accent"
              />
              <Label htmlFor="partial-toggle" className={cn(poppins_400.className, "text-sm text-ink")}>
                Partial refund
              </Label>
            </div>

            {/* Amount field */}
            {isPartial && (
              <div className="space-y-1.5">
                <Label htmlFor="refund-amount" className={cn(poppins_500.className)}>
                  Refund amount ({selected.currency})
                </Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selected.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full max-w-xs"
                />
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                  Max: {formatAmount(selected.amount, selected.currency)}
                </p>
              </div>
            )}

            {/* Reason field */}
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason" className={cn(poppins_500.className)}>
                Reason (optional)
              </Label>
              <Input
                id="refund-reason"
                type="text"
                placeholder="e.g. Customer request, duplicate charge…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className={cn(poppins_500.className, "rounded-full")}
                onClick={() => setConfirmOpen(true)}
              >
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Initiate refund
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(poppins_600.className)}>
              Confirm refund
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className={cn(poppins_400.className, "block text-sm")}>
                You are about to refund{" "}
                <strong className="text-ink">
                  {selected
                    ? formatAmount(
                        isPartial ? parseFloat(refundAmount) : selected.amount,
                        selected.currency
                      )
                    : "—"}
                </strong>{" "}
                to buyer{" "}
                <strong className="text-ink">{selected?.buyer}</strong>.
              </span>
              {selected && (
                <span className={cn(poppins_400.className, "block font-mono text-xs text-ink-muted break-all")}>
                  Wallet: {selected.buyerWallet}
                </span>
              )}
              <span className={cn(poppins_400.className, "block text-sm")}>
                This action will be logged to the audit trail and cannot be
                undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(poppins_500.className, "rounded-full")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(poppins_500.className, "rounded-full bg-destructive text-white hover:bg-destructive/90")}
              onClick={handleConfirm}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Confirm refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty state if all refunded */}
      {purchases.every((p) => p.refundStatus?.status === "refunded") && (
        <EmptyState
          icon={CheckCircle2}
          title="All purchases refunded"
          description="There are no refundable purchases in the system."
        />
      )}
    </PageShell>
  );
}

export default function PaymentsPage() {
  return (
    <AdminTierGuard>
      <PaymentsContent />
    </AdminTierGuard>
  );
}
