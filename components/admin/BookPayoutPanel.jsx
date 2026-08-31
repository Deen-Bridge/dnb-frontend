"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RangeFilter } from "@/components/admin/range-filter";
import { fetchBookPayouts } from "@/lib/actions/admin-book-payouts";
import {
  isValidStellarAddress,
  getExplorerTransactionUrl,
  getExplorerUrl,
} from "@/lib/utils/stellarExplorer";
import { config } from "@/lib/config/env";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import {
  Loader2,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  CircleDollarSign,
  BookOpen,
  Receipt,
  RefreshCw,
  PackageX,
} from "lucide-react";

function StatChip({ icon: Icon, label, value }) {
  return (
    <Card className="border shadow-none">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          <span
            className={cn(
              poppins_400.className,
              "text-xs uppercase tracking-wider"
            )}
          >
            {label}
          </span>
        </div>
        <p className={cn(poppins_600.className, "text-2xl text-foreground")}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function formatDate(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BookPayoutPanel({ book, open, onOpenChange }) {
  const [range, setRange] = useState({ from: null, to: null });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const requestIdRef = useRef(0);

  const network = config.stellarNetwork;

  const loadPayouts = useCallback(async () => {
    if (!book) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBookPayouts({
        bookId: book._id,
        bookTitle: book.title,
        creatorName: book.author?.name,
        dateFrom: range.from ? range.from.toISOString() : undefined,
        dateTo: range.to ? range.to.toISOString() : undefined,
      });
      if (requestId !== requestIdRef.current) return;
      if (res.success && res.summary) {
        setSummary(res.summary);
      } else {
        setSummary(null);
        setError(res.error || "Unable to load payout summary.");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setSummary(null);
      setError(err?.message || "Unable to load payout summary.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [book, range.from, range.to]);

  useEffect(() => {
    if (open && book) loadPayouts();
  }, [open, book, loadPayouts]);

  useEffect(() => {
    if (!open) {
      requestIdRef.current += 1;
      setRange({ from: null, to: null });
      setSummary(null);
      setError(null);
      setCopiedWallet(false);
    }
  }, [open]);

  if (!book) return null;

  const wallet = summary?.creatorWallet || "";
  const walletValid = wallet ? isValidStellarAddress(wallet) : false;
  const accountUrl = walletValid ? getExplorerUrl(wallet, network) : null;

  const handleCopyWallet = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedWallet(true);
      toast.success("Creator wallet copied to clipboard!");
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch {
      toast.error("Could not copy wallet address.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle
            className={cn("flex items-center gap-2", poppins_500.className)}
          >
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
            Author Payouts
          </DialogTitle>
          <DialogDescription className={poppins_400.className}>
            Payout summary for{" "}
            <strong className="text-foreground">{book.title}</strong> by{" "}
            {book.author?.name || "Unknown author"}. Read-only quick glance —
            reconciliation lives in the payments section.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
            {book.price === 0 && (
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            )}
          </div>
          <RangeFilter value={range} onChange={setRange} />
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className={poppins_400.className} role="status">
              Loading payout summary…
            </span>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center gap-2 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className={cn("text-sm text-muted-foreground", poppins_400.className)}>
              {error}
            </p>
            <Button variant="outline" size="sm" onClick={loadPayouts} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : summary ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatChip icon={BookOpen} label="Units Sold" value={String(summary.unitsSold)} />
              <StatChip icon={CircleDollarSign} label="Gross USDC" value={`$${summary.grossUsdc.toFixed(2)}`} />
              <StatChip icon={Receipt} label="Settlements" value={String(summary.settlements.length)} />
            </div>

            <Card className="border shadow-none">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      poppins_500.className,
                      "text-muted-foreground uppercase text-xs tracking-wider"
                    )}
                  >
                    Creator Wallet
                  </span>
                  {wallet ? (
                    walletValid ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        Validated
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600/40">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Unverified format
                      </Badge>
                    )
                  ) : (
                    <Badge variant="secondary">Not set</Badge>
                  )}
                </div>

                {wallet ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm break-all select-all">
                      {wallet}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      title="Copy wallet address"
                      aria-label="Copy wallet address"
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      {copiedWallet ? (
                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    {accountUrl && (
                      <a
                        href={accountUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        View on explorer
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Creator has no registered payout address yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {summary.settlements.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-center text-muted-foreground">
                <PackageX className="h-6 w-6" aria-hidden="true" />
                <p className={cn("text-sm", poppins_400.className)}>
                  No settlements in this period.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[110px]">Status</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="text-right w-[90px]">On-chain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.settlements.map((st) => {
                      const txUrl = st.txHash
                        ? getExplorerTransactionUrl(st.txHash, network)
                        : null;
                      return (
                        <TableRow key={st._id || st.txHash}>
                          <TableCell className="text-sm">
                            {st.buyerName || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-sm">
                              ${Number(st.amount).toFixed(2)}
                            </span>{" "}
                            <span className="text-xs text-muted-foreground">
                              USDC
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                st.status === "confirmed" ? "secondary" : "outline"
                              }
                              className="capitalize text-xs"
                            >
                              {st.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(st.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {txUrl ? (
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                                aria-label={`View settlement transaction on explorer${
                                  st.buyerName ? ` for ${st.buyerName}` : ""
                                }`}
                              >
                                View
                                <ExternalLink
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}