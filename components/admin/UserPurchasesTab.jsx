"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchGlobalTransactions } from "@/lib/actions/admin-transactions";
import { config } from "@/lib/config/env";
import { getExplorerTransactionUrl } from "@/lib/utils/stellarExplorer";

const PAGE_LIMIT = 50;

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  submitted: "bg-blue-100 text-blue-800 border-blue-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  success: "bg-green-100 text-green-800 border-green-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  expired: "bg-gray-100 text-gray-800 border-gray-300",
};

function truncateHash(value, start = 6, end = 6) {
  if (!value) return "N/A";
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "N/A";
  return `${value.toFixed(2)} USDC`;
}

/**
 * Read-only purchase history for a learner (#228).
 * Source: GET /api/admin/transactions (fetchGlobalTransactions) filtered by the
 * learner's Stellar wallet as buyerWallet. Refund and cancel controls are
 * intentionally absent; they belong to the payments section.
 */
export default function UserPurchasesTab({ walletAddress }) {
  const [state, setState] = useState({ loading: true, transactions: [], total: 0, error: null });
  const network = config.stellarNetwork;

  useEffect(() => {
    let active = true;
    if (!walletAddress) {
      setState({ loading: false, transactions: [], total: 0, error: null });
      return () => {
        active = false;
      };
    }
    setState({ loading: true, transactions: [], total: 0, error: null });
    fetchGlobalTransactions({ buyerWallet: walletAddress, page: 1, limit: PAGE_LIMIT })
      .then((res) => {
        if (!active) return;
        if (res?.success) {
          setState({
            loading: false,
            transactions: res.transactions || [],
            total: res.pagination?.total ?? (res.transactions || []).length,
            error: null,
          });
        } else {
          setState({
            loading: false,
            transactions: [],
            total: 0,
            error: res?.error || "Failed to load purchases.",
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        setState({
          loading: false,
          transactions: [],
          total: 0,
          error: err?.message || "Failed to load purchases.",
        });
      });
    return () => {
      active = false;
    };
  }, [walletAddress]);

  const copyHash = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Transaction hash copied to clipboard.");
    } catch {
      toast.error("Could not copy the transaction hash.");
    }
  };

  const renderBody = () => {
    if (state.loading) {
      return (
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }
    if (state.error) {
      return (
        <div role="alert" className="p-4 text-sm text-red-700">
          {state.error}
        </div>
      );
    }
    if (!walletAddress) {
      return (
        <EmptyState
          icon={Receipt}
          title="No Stellar wallet"
          description="This user has not connected a wallet, so no purchases can be matched."
          className="border-0 shadow-none"
        />
      );
    }
    if (state.transactions.length === 0) {
      return (
        <EmptyState
          icon={Receipt}
          title="No purchases"
          description="No purchase transactions found for this user's wallet."
          className="border-0 shadow-none"
        />
      );
    }
    return (
      <Table aria-label="User purchases">
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.transactions.map((tx) => {
            const hash = tx.txHash || tx._id;
            const explorerUrl = tx.txHash ? getExplorerTransactionUrl(tx.txHash, network) : null;
            const statusKey = String(tx.status || "").toLowerCase();
            return (
              <TableRow key={tx._id || tx.txHash}>
                <TableCell className="text-xs">
                  <div className="font-medium">{tx.itemTitle || "Untitled item"}</div>
                  <div className="text-muted-foreground capitalize">{tx.itemType || "N/A"}</div>
                </TableCell>
                <TableCell className="text-right text-xs font-semibold">
                  {formatAmount(tx.amount)}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-mono" title={hash || undefined}>
                      {truncateHash(hash)}
                    </span>
                    {hash && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyHash(hash)}
                        aria-label={`Copy transaction hash ${hash}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                        aria-label="View transaction on Stellar explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_STYLES[statusKey] || ""}>
                    {tx.status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{formatDate(tx.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Purchases</CardTitle>
        <CardDescription className="text-xs">
          Payments made by this learner&apos;s wallet. Read-only.
          {state.total > state.transactions.length && !state.loading
            ? ` Showing the latest ${state.transactions.length} of ${state.total}.`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{renderBody()}</CardContent>
    </Card>
  );
}
