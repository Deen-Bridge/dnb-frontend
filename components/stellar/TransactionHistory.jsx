"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import useStellarPayment from "@/hooks/useStellarPayment";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default function TransactionHistory() {
  const { getTransactionHistory } = useStellarPayment();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [role, setRole] = useState("buyer");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const result = await getTransactionHistory({
      role,
      page: pagination.page,
      limit: pagination.limit,
    });
    if (result.success) {
      setTransactions(result.transactions);
      setPagination(result.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [role, pagination.page]);

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">As Buyer</SelectItem>
            <SelectItem value="creator">As Creator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No transactions found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "buyer"
              ? "You haven't made any purchases yet"
              : "You haven't received any payments yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>{role === "buyer" ? "To" : "From"}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.itemType === "book" ? (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">
                            {tx.itemTitle}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {tx.itemType}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${tx.amount}</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        USDC
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {role === "buyer"
                            ? tx.creator?.name
                            : tx.buyer?.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(
                            role === "buyer" ? tx.creatorWallet : tx.buyerWallet
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[tx.status]}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(tx.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.explorerUrl && (
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View transaction for ${tx.itemTitle} on Stellar Explorer`}
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                transactions)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
