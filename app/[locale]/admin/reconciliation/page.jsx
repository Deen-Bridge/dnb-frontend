"use client";

import { useState, useCallback } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Scale,
  Calendar as CalendarIcon,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Download,
  Info,
  ArrowUpRight,
} from "lucide-react";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { TableEmptyState } from "@/components/admin/table-empty-state";
import { TableErrorState } from "@/components/admin/table-error-state";
import { RefetchBanner } from "@/components/admin/refetch-banner";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format, subDays } from "date-fns";

// Reconciliation status types
const STATUS_CONFIG = {
  matched: {
    label: "Matched",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
  },
  "missing-on-chain": {
    label: "Missing On-Chain",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
  },
  "amount-mismatch": {
    label: "Amount Mismatch",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
  },
};

// Generate mock reconciliation data
const generateMockData = (dateFrom, dateTo) => {
  const transactions = [];
  const daysDiff = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < Math.min(daysDiff * 3, 50); i++) {
    const date = new Date(
      dateFrom.getTime() + Math.random() * (dateTo.getTime() - dateFrom.getTime())
    );

    // 80% matched, 10% missing, 10% mismatch
    const rand = Math.random();
    let status;
    let platformAmount;
    let onChainAmount;

    if (rand < 0.8) {
      status = "matched";
      platformAmount = Math.floor(Math.random() * 200 + 10);
      onChainAmount = platformAmount;
    } else if (rand < 0.9) {
      status = "missing-on-chain";
      platformAmount = Math.floor(Math.random() * 200 + 10);
      onChainAmount = null;
    } else {
      status = "amount-mismatch";
      platformAmount = Math.floor(Math.random() * 200 + 10);
      onChainAmount = platformAmount + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 1);
    }

    const txHash = status !== "missing-on-chain"
      ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
      : null;

    transactions.push({
      id: `txn_${i}_${Date.now()}`,
      platformId: `PLT-${String(100000 + i).slice(1)}`,
      timestamp: date.toISOString(),
      creatorEmail: `educator${i % 10 + 1}@example.com`,
      creatorId: `usr_${1000 + (i % 10)}`,
      itemType: Math.random() > 0.5 ? "course" : "book",
      itemTitle: Math.random() > 0.5 ? `Course ${i + 1}` : `Book ${i + 1}`,
      platformAmount,
      onChainAmount,
      currency: "USDC",
      txHash,
      status,
    });
  }

  return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Stellar explorer URL
const getStellarExplorerUrl = (txHash) => {
  return `https://stellar.expert/explorer/public/tx/${txHash}`;
};

export default function PayoutReconciliationPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch reconciliation data
  const handleSearch = useCallback(async (isRefetch = false) => {
    if (!dateRange.from || !dateRange.to) return;

    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setLoading(true);
    }
    setHasSearched(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate occasional error for demo
      if (Math.random() < 0.05) {
        throw new Error("Failed to fetch reconciliation data");
      }

      const data = generateMockData(dateRange.from, dateRange.to);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [dateRange]);

  // Calculate stats
  const stats = {
    total: transactions.length,
    matched: transactions.filter((t) => t.status === "matched").length,
    missingOnChain: transactions.filter((t) => t.status === "missing-on-chain").length,
    amountMismatch: transactions.filter((t) => t.status === "amount-mismatch").length,
  };

  const discrepancyCount = stats.missingOnChain + stats.amountMismatch;

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Platform ID",
      "Timestamp",
      "Creator",
      "Item",
      "Platform Amount",
      "On-Chain Amount",
      "Status",
      "TX Hash",
    ];

    const rows = transactions.map((t) => [
      t.platformId,
      t.timestamp,
      t.creatorEmail,
      `${t.itemType}: ${t.itemTitle}`,
      t.platformAmount,
      t.onChainAmount ?? "N/A",
      t.status,
      t.txHash ?? "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reconciliation-${format(dateRange.from, "yyyy-MM-dd")}-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <PageShell>
      <PageHeader
        icon={Scale}
        title="Payout Reconciliation"
        subtitle="Compare platform records with blockchain transactions"
      />

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50" role="note">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100" aria-hidden="true">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className={cn(poppins_500.className, "text-sm text-blue-800")}>
              Read-Only Verification Tool
            </p>
            <p className={cn(poppins_400.className, "text-xs text-blue-700")}>
              This tool compares platform purchase records with Stellar blockchain data.
              No data modifications are made.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date Range</CardTitle>
          <CardDescription>
            Choose the period to reconcile transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="space-y-2 flex-1">
              <label className={cn(poppins_500.className, "text-sm")}>Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <span className="truncate">{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</span>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={!dateRange.from || !dateRange.to || loading} className="flex-1 sm:flex-none">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Run Reconciliation
              </Button>

              {transactions.length > 0 && (
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <>
          <RefetchBanner isRefetching={isRefetching} />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
            <Card>
              <CardContent className="p-4">
                <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                  Total Transactions
                </p>
                <p className={cn(poppins_600.className, "text-2xl")}>{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4">
                <p className={cn(poppins_400.className, "text-xs text-green-700")}>
                  Matched
                </p>
                <p className={cn(poppins_600.className, "text-2xl text-green-600")}>
                  {stats.matched}
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4">
                <p className={cn(poppins_400.className, "text-xs text-red-700")}>
                  Missing On-Chain
                </p>
                <p className={cn(poppins_600.className, "text-2xl text-red-600")}>
                  {stats.missingOnChain}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <p className={cn(poppins_400.className, "text-xs text-amber-700")}>
                  Amount Mismatch
                </p>
                <p className={cn(poppins_600.className, "text-2xl text-amber-600")}>
                  {stats.amountMismatch}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Discrepancy Alert */}
          {discrepancyCount > 0 && (
            <Card className="border-red-200 bg-red-50" role="alert" aria-live="polite">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className={cn(poppins_600.className, "text-red-800")}>
                    {discrepancyCount} Discrepanc{discrepancyCount === 1 ? "y" : "ies"} Found
                  </p>
                  <p className={cn(poppins_400.className, "text-sm text-red-700")}>
                    Review the highlighted rows below for manual investigation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Records</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `${transactions.length} transactions found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <TableErrorState message={error} onRetry={() => handleSearch(true)} />
              ) : loading ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Platform Amount</TableHead>
                        <TableHead className="text-right">On-Chain Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Links</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableSkeleton rows={5} columns={8} />
                    </TableBody>
                  </Table>
                </div>
              ) : transactions.length === 0 ? (
                <TableEmptyState
                  icon={Scale}
                  title="No transactions found"
                  description="No transactions found for the selected date range. Try a different date range."
                />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Platform ID</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Creator</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Platform Amount</TableHead>
                          <TableHead className="text-right">On-Chain Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Links</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => {
                          const statusConfig = STATUS_CONFIG[tx.status];
                          const StatusIcon = statusConfig.icon;
                          const isDiscrepancy = tx.status !== "matched";

                          return (
                            <TableRow
                              key={tx.id}
                              className={cn(isDiscrepancy && statusConfig.bgColor, isDiscrepancy && "hover:opacity-90")}
                            >
                              <TableCell className="font-mono text-sm">{tx.platformId}</TableCell>
                              <TableCell className="text-sm">{format(new Date(tx.timestamp), "MMM d, HH:mm")}</TableCell>
                              <TableCell className="text-sm">{tx.creatorEmail}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <Badge variant="outline" className="mr-2 text-xs">{tx.itemType}</Badge>
                                  {tx.itemTitle}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono">${tx.platformAmount.toFixed(2)}</TableCell>
                              <TableCell className={cn("text-right font-mono", tx.status === "amount-mismatch" && "text-amber-700 font-bold")}>
                                {tx.onChainAmount !== null ? `$${tx.onChainAmount.toFixed(2)}` : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs gap-1", statusConfig.color, statusConfig.borderColor)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                    <a href={`/admin/transactions/${tx.id}`}>Platform<ArrowUpRight className="ml-1 h-3 w-3" /></a>
                <div className="rounded-lg border overflow-x-auto">
                  <Table aria-label="Reconciliation transaction records">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Platform Amount</TableHead>
                        <TableHead className="text-right">On-Chain Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Links</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => {
                        const statusConfig = STATUS_CONFIG[tx.status];
                        const StatusIcon = statusConfig.icon;
                        const isDiscrepancy = tx.status !== "matched";

                        return (
                          <TableRow
                            key={tx.id}
                            className={cn(
                              isDiscrepancy && statusConfig.bgColor,
                              isDiscrepancy && "hover:opacity-90"
                            )}
                          >
                            <TableCell className="font-mono text-sm">
                              {tx.platformId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(tx.timestamp), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-sm">{tx.creatorEmail}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <Badge variant="outline" className="mr-2 text-xs">
                                  {tx.itemType}
                                </Badge>
                                {tx.itemTitle}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${tx.platformAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className={cn(
                              "text-right font-mono",
                              tx.status === "amount-mismatch" && "text-amber-700 font-bold"
                            )}>
                              {tx.onChainAmount !== null
                                ? `$${tx.onChainAmount.toFixed(2)}`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs gap-1",
                                  statusConfig.color,
                                  statusConfig.borderColor
                                )}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  asChild
                                >
                                  <a href={`/admin/transactions/${tx.id}`} aria-label={`View platform transaction ${tx.platformId}`}>
                                    Platform
                                    <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                                  </a>
                                </Button>
                                {tx.txHash && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    asChild
                                  >
                                    <a
                                      href={getStellarExplorerUrl(tx.txHash)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`View on Stellar explorer for transaction ${tx.platformId}`}
                                    >
                                      Stellar
                                      <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
                                    </a>
                                  </Button>
                                  {tx.txHash && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                      <a href={getStellarExplorerUrl(tx.txHash)} target="_blank" rel="noopener noreferrer">Stellar<ExternalLink className="ml-1 h-3 w-3" /></a>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {transactions.map((tx) => {
                      const statusConfig = STATUS_CONFIG[tx.status];
                      const StatusIcon = statusConfig.icon;
                      const isDiscrepancy = tx.status !== "matched";

                      return (
                        <div key={tx.id} className={cn("rounded-lg border p-3 space-y-2", isDiscrepancy && statusConfig.bgColor)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-mono text-xs">{tx.platformId}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(tx.timestamp), "MMM d, HH:mm")}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", statusConfig.color, statusConfig.borderColor)}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{tx.creatorEmail}</div>
                          <div className="text-sm">
                            <Badge variant="outline" className="mr-1.5 text-[10px]">{tx.itemType}</Badge>
                            {tx.itemTitle}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="text-muted-foreground">Platform: </span>
                              <span className="font-mono">${tx.platformAmount.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Chain: </span>
                              <span className={cn("font-mono", tx.status === "amount-mismatch" && "text-amber-700 font-bold")}>
                                {tx.onChainAmount !== null ? `$${tx.onChainAmount.toFixed(2)}` : "—"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 pt-1">
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" asChild>
                              <a href={`/admin/transactions/${tx.id}`}>Platform<ArrowUpRight className="ml-0.5 h-2.5 w-2.5" /></a>
                            </Button>
                            {tx.txHash && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" asChild>
                                <a href={getStellarExplorerUrl(tx.txHash)} target="_blank" rel="noopener noreferrer">Stellar<ExternalLink className="ml-0.5 h-2.5 w-2.5" /></a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageShell>
  );
}
