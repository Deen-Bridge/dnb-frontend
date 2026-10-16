"tuse client";

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
  Download,
  Loader2,
  Info,
  ArrowUpRight,
} from "lucide-react";
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

// Stellar explorer URL
function getStellarExplorerUrl(txHash) {
  return `https://stellar.expert/explorer/public/tx/${txHash}`;
}

function formatDateRange(range) {
  if (!range?.from) return "Select date range";
  if (range.to) {
    return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`;
  }
  return format(range.from, "LLL dd, y");
}

export default function PayoutReconciliationPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reconciliation data
  const handleSearch = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/admin/reconciliation?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const payload = await res.json();
      setTransactions(Array.isArray(payload?.transactions) ? payload.transactions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reconciliation data");
      setTransactions([]);
    } finally {
      setLoading(false);
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
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
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
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <span className={cn(poppins_500.className, "text-sm block")}>Date Range</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange(dateRange)}
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

            <Button
              onClick={handleSearch}
              disabled={!dateRange.from || !dateRange.to || loading}
            >
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
        </CardContent>
      </Card>

      {/* Error State */}
      {hasSearched && error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className={cn(poppins_600.className, "text-red-800")}>
                Failed to load reconciliation data
              </p>
              <p className={cn(poppins_400.className, "text-sm text-red-700")}>
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasSearched && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className={cn(poppins_600.className, "text-red-800")}>
                    {discrepancyCount} Discrepanc{discrepancyCount === 1 ? "y" : "ines"} Found
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No transactions found for the selected date range
                </div>
              ) : (
                <div className="rounded-lg border overflow-x-auto">
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
                        <TableHead>TX Hash</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => {
                        const config = STATUS_CONFIG[t.status] || STATUS_CONFIG.matched;
                        const StatusIcon = config.icon;
                        const isDiscrepancy =
                          t.status === "missing-on-chain" || t.status === "amount-mismatch";
                        return (
                          <TableRow
                            key={t.platformId}
                            className={cn(isDiscrepancy && "bg-red-50/50")}
                          >
                            <TableCell className="font-medium">{t.platformId}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {t.timestamp ? format(new Date(t.timestamp), "PPp") : "N/A"}
                            </TableCell>
                            <TableCell>{t.creatorEmail}</TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{t.itemType}</span>
                              <br />
                              {t.itemTitle}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {t.platformAmount}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {t.onChainAmount ?? "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={cn("h-4 w-4", config.color)} />
                                <span className={cn(poppins_500.className, "text-sm", config.color)}>
                                  {config.label}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {t.txHash ? (
                                <a
                                  href={getStellarExplorerUrl(t.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <span className="font-mono text-xs">
                                    {t.txHash.slice(0, 8)}...{t.txHash.slice(-8)}
                                  </span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
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
        </>
      )}
    </PageShell>
  );
}
