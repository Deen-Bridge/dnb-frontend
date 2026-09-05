"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  X,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGlobalTransactions } from "@/lib/actions/admin-transactions";
import {
  getExplorerTransactionUrl,
  isValidStellarAddress,
} from "@/lib/utils/stellarExplorer";
import { downloadCsv } from "@/lib/utils/csv";
import { config } from "@/lib/config/env";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  submitted: "bg-blue-100 text-blue-800 border-blue-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  success: "bg-green-100 text-green-800 border-green-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  expired: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function GlobalTransactionExplorer() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
    itemType: "all",
    minAmount: "",
    maxAmount: "",
    buyerWallet: "",
    creatorWallet: "",
  });

  // Validation state for Stellar addresses
  const [buyerWalletError, setBuyerWalletError] = useState("");
  const [creatorWalletError, setCreatorWalletError] = useState("");

  const validateWallets = useCallback((buyerWallet, creatorWallet) => {
    let valid = true;
    if (buyerWallet && buyerWallet.trim() !== "") {
      if (!isValidStellarAddress(buyerWallet.trim())) {
        setBuyerWalletError("Invalid Stellar address format (must start with G and be 56 characters)");
        valid = false;
      } else {
        setBuyerWalletError("");
      }
    } else {
      setBuyerWalletError("");
    }

    if (creatorWallet && creatorWallet.trim() !== "") {
      if (!isValidStellarAddress(creatorWallet.trim())) {
        setCreatorWalletError("Invalid Stellar address format (must start with G and be 56 characters)");
        valid = false;
      } else {
        setCreatorWalletError("");
      }
    } else {
      setCreatorWalletError("");
    }

    return valid;
  }, []);

  // Fetch transactions from server with current page & filters
  const loadTransactions = useCallback(
    async (pageOverride, limitOverride) => {
      const pageToFetch = pageOverride !== undefined ? pageOverride : pagination.page;
      const limitToFetch = limitOverride !== undefined ? limitOverride : pagination.limit;

      // Validate wallet formats before querying
      const isWalletValid = validateWallets(filters.buyerWallet, filters.creatorWallet);
      if (!isWalletValid) {
        toast.error("Please fix invalid Stellar address format before searching");
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await fetchGlobalTransactions({
        page: pageToFetch,
        limit: limitToFetch,
        ...filters,
      });

      if (result.success) {
        setTransactions(result.transactions || []);
        setPagination(
          result.pagination || { page: pageToFetch, limit: limitToFetch, total: 0, pages: 1 }
        );
      } else {
        setError(result.error || "Failed to fetch transactions");
        setTransactions([]);
      }

      setIsLoading(false);
    },
    [filters, pagination.page, pagination.limit, validateWallets]
  );

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-deps
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    if (key === "buyerWallet") {
      if (value && !isValidStellarAddress(value.trim())) {
        setBuyerWalletError("Invalid Stellar address format (must start with G and be 56 characters)");
      } else {
        setBuyerWalletError("");
      }
    }

    if (key === "creatorWallet") {
      if (value && !isValidStellarAddress(value.trim())) {
        setCreatorWalletError("Invalid Stellar address format (must start with G and be 56 characters)");
      } else {
        setCreatorWalletError("");
      }
    }
  };

  const handleApplySearch = (e) => {
    if (e) e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadTransactions(1);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      dateFrom: "",
      dateTo: "",
      status: "all",
      itemType: "all",
      minAmount: "",
      maxAmount: "",
      buyerWallet: "",
      creatorWallet: "",
    };
    setFilters(emptyFilters);
    setBuyerWalletError("");
    setCreatorWalletError("");
    setPagination((prev) => ({ ...prev, page: 1 }));

    setIsLoading(true);
    fetchGlobalTransactions({ page: 1, limit: pagination.limit, ...emptyFilters }).then(
      (result) => {
        if (result.success) {
          setTransactions(result.transactions || []);
          setPagination(result.pagination);
        }
        setIsLoading(false);
      }
    );
  };

  const handleCopyHash = (txHash) => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedHash(txHash);
    toast.success("Transaction hash copied to clipboard!");
    setTimeout(() => {
      setCopiedHash(null);
    }, 2000);
  };

  const handleExportCSV = async () => {
    const isWalletValid = validateWallets(filters.buyerWallet, filters.creatorWallet);
    if (!isWalletValid) {
      toast.error("Please fix invalid Stellar address before exporting");
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all matching records for CSV export (using high limit)
      const exportData = await fetchGlobalTransactions({
        page: 1,
        limit: 1000,
        ...filters,
      });

      const recordsToExport = exportData.success ? exportData.transactions : transactions;

      const headers = [
        "Transaction Hash / Ref",
        "Date",
        "Type",
        "Item Title",
        "Amount (USDC)",
        "Status",
        "Buyer Name",
        "Buyer Wallet",
        "Creator Name",
        "Creator Wallet",
      ];

      const rows = recordsToExport.map((tx) => [
        tx.txHash || tx._id || "N/A",
        new Date(tx.createdAt).toISOString(),
        tx.itemType || "N/A",
        tx.itemTitle || "N/A",
        tx.amount !== undefined ? tx.amount : 0,
        tx.status || "N/A",
        tx.buyer?.name || tx.buyer?.email || "N/A",
        tx.buyerWallet || "N/A",
        tx.creator?.name || tx.creator?.email || "N/A",
        tx.creatorWallet || "N/A",
      ]);

      const filename = `global-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv({ filename, headers, rows });
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to generate CSV export");
    } finally {
      setIsExporting(false);
    }
  };

  const truncateText = (text, start = 6, end = 6) => {
    if (!text) return "N/A";
    if (text.length <= start + end + 3) return text;
    return `${text.slice(0, start)}...${text.slice(-end)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const network = config.stellarNetwork;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Global Transaction Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide transaction history with real-time filters and network-aware chain verification ({network}).
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={isLoading || isExporting || transactions.length === 0}
          aria-label="Export CSV"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Advanced Filters Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Advanced Filters
          </CardTitle>
          <CardDescription>
            Filter platform transactions by date, status, item type, amount, or wallet address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleApplySearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Date From */}
              <div className="space-y-1.5">
                <label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">
                  Date From
                </label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="h-9 text-sm"
                  aria-label="Filter by start date"
                />
              </div>

              {/* Date To */}
              <div className="space-y-1.5">
                <label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">
                  Date To
                </label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="h-9 text-sm"
                  aria-label="Filter by end date"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label htmlFor="statusFilter" className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(val) => handleFilterChange("status", val)}
                >
                  <SelectTrigger id="statusFilter" className="h-9 text-sm" aria-label="Filter by status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Success / Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Item Type Filter */}
              <div className="space-y-1.5">
                <label htmlFor="itemTypeFilter" className="text-xs font-medium text-muted-foreground">
                  Item Type
                </label>
                <Select
                  value={filters.itemType}
                  onValueChange={(val) => handleFilterChange("itemType", val)}
                >
                  <SelectTrigger id="itemTypeFilter" className="h-9 text-sm" aria-label="Filter by item type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Amount */}
              <div className="space-y-1.5">
                <label htmlFor="minAmount" className="text-xs font-medium text-muted-foreground">
                  Min Amount (USDC)
                </label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  className="h-9 text-sm"
                  aria-label="Filter by minimum amount"
                />
              </div>

              {/* Max Amount */}
              <div className="space-y-1.5">
                <label htmlFor="maxAmount" className="text-xs font-medium text-muted-foreground">
                  Max Amount (USDC)
                </label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="1000.00"
                  min="0"
                  step="any"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  className="h-9 text-sm"
                  aria-label="Filter by maximum amount"
                />
              </div>

              {/* Buyer Wallet */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="buyerWallet" className="text-xs font-medium text-muted-foreground">
                  Buyer Wallet Search
                </label>
                <Input
                  id="buyerWallet"
                  type="text"
                  placeholder="G... (Stellar Public Key)"
                  value={filters.buyerWallet}
                  onChange={(e) => handleFilterChange("buyerWallet", e.target.value)}
                  className={cn(
                    "h-9 text-sm font-mono",
                    buyerWalletError && "border-red-500 focus-visible:ring-red-500"
                  )}
                  aria-label="Search by buyer wallet address"
                />
                {buyerWalletError && (
                  <p className="text-[11px] text-red-500 mt-0.5">{buyerWalletError}</p>
                )}
              </div>

              {/* Creator Wallet */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="creatorWallet" className="text-xs font-medium text-muted-foreground">
                  Creator Wallet Search
                </label>
                <Input
                  id="creatorWallet"
                  type="text"
                  placeholder="G... (Stellar Public Key)"
                  value={filters.creatorWallet}
                  onChange={(e) => handleFilterChange("creatorWallet", e.target.value)}
                  className={cn(
                    "h-9 text-sm font-mono",
                    creatorWalletError && "border-red-500 focus-visible:ring-red-500"
                  )}
                  aria-label="Search by creator wallet address"
                />
                {creatorWalletError && (
                  <p className="text-[11px] text-red-500 mt-0.5">{creatorWalletError}</p>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Reset filters"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isLoading || Boolean(buyerWalletError || creatorWalletError)}
                className="gap-1.5 text-xs"
                aria-label="Apply filters"
              >
                <Search className="h-3.5 w-3.5" />
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load transactions</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => loadTransactions()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && !error && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center py-16 border rounded-lg bg-card">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-foreground text-base">No transactions found</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            No transactions match the selected filter criteria. Try adjusting your date range, amount, or wallet address filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
            onClick={handleResetFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Transactions Table */}
      {!isLoading && !error && transactions.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            <Table aria-label="Global Transactions Explorer Table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Tx Hash / Ref</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const hashOrId = tx.txHash || tx._id;
                  const explorerUrl = tx.txHash
                    ? getExplorerTransactionUrl(tx.txHash, network)
                    : null;

                  return (
                    <TableRow key={tx._id || tx.txHash}>
                      {/* Tx Hash / ID with Copy */}
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span title={hashOrId}>{truncateText(hashOrId, 6, 6)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(hashOrId)}
                            aria-label={`Copy transaction hash ${hashOrId}`}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                          >
                            {copiedHash === hashOrId ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Item */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.itemType === "book" ? (
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div className="max-w-[200px]">
                            <p className="font-medium text-sm line-clamp-1" title={tx.itemTitle}>
                              {tx.itemTitle}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-wider py-0 px-1 mt-0.5"
                            >
                              {tx.itemType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="font-semibold text-sm">${tx.amount}</span>
                        <span className="text-muted-foreground text-xs ml-1">USDC</span>
                      </TableCell>

                      {/* Buyer */}
                      <TableCell>
                        <div className="max-w-[160px]">
                          <p className="font-medium text-sm line-clamp-1">
                            {tx.buyer?.name || tx.buyer?.email || "N/A"}
                          </p>
                          <p
                            className="text-[11px] text-muted-foreground font-mono truncate"
                            title={tx.buyerWallet}
                          >
                            {truncateText(tx.buyerWallet, 5, 5)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Creator */}
                      <TableCell>
                        <div className="max-w-[160px]">
                          <p className="font-medium text-sm line-clamp-1">
                            {tx.creator?.name || tx.creator?.email || "N/A"}
                          </p>
                          <p
                            className="text-[11px] text-muted-foreground font-mono truncate"
                            title={tx.creatorWallet}
                          >
                            {truncateText(tx.creatorWallet, 5, 5)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize text-xs border font-medium",
                            statusColors[tx.status?.toLowerCase()] || "bg-gray-100 text-gray-800"
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions (Explorer link) */}
                      <TableCell className="text-right">
                        {explorerUrl ? (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View transaction ${hashOrId} on Stellar Explorer (${network})`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            Explorer
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-medium">{pagination.page}</span> of{" "}
                <span className="font-medium">{pagination.pages}</span> ({pagination.total}{" "}
                transactions total)
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rows per page:</span>
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => {
                    const newLimit = Number(val);
                    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
                    loadTransactions(1, newLimit);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs" aria-label="Select rows per page">
                    <SelectValue placeholder={String(pagination.limit)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = pagination.page - 1;
                  setPagination((p) => ({ ...p, page: newPage }));
                  loadTransactions(newPage);
                }}
                disabled={pagination.page <= 1 || isLoading}
                aria-label="Previous page"
                className="h-8 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = pagination.page + 1;
                  setPagination((p) => ({ ...p, page: newPage }));
                  loadTransactions(newPage);
                }}
                disabled={pagination.page >= pagination.pages || isLoading}
                aria-label="Next page"
                className="h-8 text-xs gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}