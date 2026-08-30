"use client";

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
  Printer,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Copy,
  Check,
  CreditCard,
  User,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { getExplorerTransactionUrl } from "@/lib/utils/stellarExplorer";
import { config } from "@/lib/config/env";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TransactionDrawer({ transaction, open, onOpenChange }) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!transaction) return null;

  const network = config.stellarNetwork;
  const hashOrId = transaction.txHash || transaction._id;
  const explorerUrl = transaction.txHash
    ? getExplorerTransactionUrl(transaction.txHash, network)
    : null;

  const handleCopyHash = () => {
    if (!hashOrId) return;
    navigator.clipboard.writeText(hashOrId);
    setCopiedHash(true);
    toast.success("Transaction hash copied to clipboard!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-card border shadow-xl">
        <div className="print-root space-y-6">
          {/* Header & Print Actions */}
          <DialogHeader className="flex flex-row items-start justify-between pb-2 border-b">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary no-print" />
                Transaction Record Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Platform Reference ID: <span className="font-mono font-semibold">{transaction._id}</span>
              </DialogDescription>
            </div>

            {/* Print Record Button (Hidden during print) */}
            <div className="no-print flex items-center gap-2 pr-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="no-print gap-2 text-xs font-semibold"
                aria-label="Print record"
              >
                <Printer className="h-4 w-4" />
                Print Record
              </Button>
            </div>
          </DialogHeader>

          {/* Main Transaction Context Card */}
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Transaction Hash */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                    Transaction Hash / On-Chain Ref
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm break-all font-medium select-all">
                      {hashOrId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="no-print p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Copy Hash"
                    >
                      {copiedHash ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                    Amount Paid
                  </span>
                  <p className="text-lg font-bold text-foreground font-mono">
                    ${transaction.amount}{" "}
                    <span className="text-xs font-normal text-muted-foreground">USDC</span>
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                    Transaction Status
                  </span>
                  <Badge variant="secondary" className="capitalize font-medium">
                    {transaction.status}
                  </Badge>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                    Timestamp
                  </span>
                  <p className="text-sm font-medium">
                    {new Date(transaction.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>

                {/* Item Purchased */}
                <div className="space-y-1 sm:col-span-2 border-t pt-3">
                  <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                    Item Purchased
                  </span>
                  <div className="flex items-center gap-2">
                    {transaction.itemType === "book" ? (
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{transaction.itemTitle}</p>
                      <Badge variant="outline" className="text-[10px] uppercase mt-0.5">
                        {transaction.itemType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer & Creator Party Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buyer Info */}
            <Card className="border shadow-none">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Buyer Details</h4>
                </div>
                <div>
                  <span className="text-muted-foreground block">Name / Email:</span>
                  <p className="font-medium">
                    {transaction.buyer?.name || transaction.buyer?.email || "N/A"}
                  </p>
                  {transaction.buyer?.email && (
                    <a href={`mailto:${transaction.buyer.email}`} className="text-primary hover:underline text-[11px] print-url">
                      {transaction.buyer.email}
                    </a>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Buyer Stellar Wallet:</span>
                  <p className="font-mono text-[11px] break-all">
                    {transaction.buyerWallet || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card className="border shadow-none">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Creator Details</h4>
                </div>
                <div>
                  <span className="text-muted-foreground block">Name / Email:</span>
                  <p className="font-medium">
                    {transaction.creator?.name || transaction.creator?.email || "N/A"}
                  </p>
                  {transaction.creator?.email && (
                    <a href={`mailto:${transaction.creator.email}`} className="text-primary hover:underline text-[11px] print-url">
                      {transaction.creator.email}
                    </a>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Creator Stellar Wallet:</span>
                  <p className="font-mono text-[11px] break-all">
                    {transaction.creatorWallet || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Explorer Deep Link */}
          {explorerUrl && (
            <div className="p-3 border rounded-lg bg-muted/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified On-Chain ({network.toUpperCase()})</span>
              </div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1 print-url"
              >
                View on Stellar Expert
                <ExternalLink className="h-3.5 w-3.5 no-print" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
