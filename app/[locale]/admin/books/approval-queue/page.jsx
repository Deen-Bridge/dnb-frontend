"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  Eye,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";
import MediaBlurToggle from "@/components/admin/MediaBlurToggle";
import axiosInstance from "@/lib/config/axios.config";

const STATUS_CONFIG = {
  "pending-review": {
    label: "Pending Review",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  "changes-requested": {
    label: "Changes Requested",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
};

function formatAge(timestamp) {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookApprovalQueuePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const itemsPerPage = 10;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/admin/books/approval-queue");
      setBooks(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load submissions");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (statusFilter === "all") return books;
    return books.filter((b) => b.status === statusFilter);
  }, [books, statusFilter]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusCounts = useMemo(() => {
    const counts = {};
    Object.keys(STATUS_CONFIG).forEach((key) => {
      counts[key] = books.filter((b) => b.status === key).length;
    });
    return counts;
  }, [books]);

  const openDetail = useCallback((book) => {
    setSelectedBook(book);
    setDetailOpen(true);
    setActionType(null);
    setActionNotes("");
  }, []);

  const handleAction = useCallback(async (type) => {
    setActionType(type);
    if (type === "approve") {
      setActionNotes("");
    }
  }, []);

  const confirmAction = useCallback(async () => {
    if (!selectedBook || !actionType) return;
    setProcessing(true);
    try {
      await axiosInstance.post(
        `/admin/books/approval-queue/${selectedBook.id}/${actionType}`,
        actionType === "approve" ? {} : { notes: actionNotes }
      );
      setDetailOpen(false);
      setSelectedBook(null);
      setActionType(null);
      setActionNotes("");
      await fetchBooks();
    } catch (err) {
      setError(err?.message || "Failed to process submission");
    } finally {
      setProcessing(false);
    }
  }, [selectedBook, actionType, actionNotes, fetchBooks]);

  return (
    <PageShell>
      <PageHeader
        icon={BookOpen}
        title="Book Approval Queue"
        subtitle="Review and manage new book submissions"
        actions={
          <div className="flex items-center gap-3">
            <MediaBlurToggle className="hidden lg:flex" />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBooks}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary" className="ml-1">
                  {books.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending-review" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
                <Badge variant="secondary" className="ml-1">
                  {statusCounts["pending-review"]}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
                <Badge variant="secondary" className="ml-1">
                  {statusCounts.approved}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
                <Badge variant="secondary" className="ml-1">
                  {statusCounts.rejected}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="changes-requested" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Changes Requested
                <Badge variant="secondary" className="ml-1">
                  {statusCounts["changes-requested"]}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Submissions ({filteredBooks.length})
          </CardTitle>
          <CardDescription>
            New book submissions awaiting review or already processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
                      <p>Loading submissions…</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={fetchBooks}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : paginatedBooks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No submissions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBooks.map((book) => {
                    const statusConf = STATUS_CONFIG[book.status];
                    return (
                      <TableRow
                        key={book.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetail(book)}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatDate(book.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">
                                {book.uploader.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{book.uploader.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(poppins_500.className, "text-sm")}>
                            {book.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {book.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${book.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              statusConf.color,
                              statusConf.bgColor
                            )}
                          >
                            {statusConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetail(book);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {book.status === "pending-review" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetail(book);
                                      setTimeout(() => handleAction("approve"), 100);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetail(book);
                                      setTimeout(() => handleAction("reject"), 100);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetail(book);
                                      setTimeout(() => handleAction("changes-requested"), 100);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Request Changes
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p
                className={cn(
                  poppins_400.className,
                  "text-sm text-muted-foreground"
                )}
              >
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBook && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedBook.title}
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDate(selectedBook.submittedAt)} &middot;{" "}
                  {formatAge(selectedBook.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Book Info */}
              <Card>
                <CardContent className="py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Uploader:</span>{" "}
                      <span className={cn(poppins_500.className)}>
                        {selectedBook.uploader.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      <span className="font-mono text-xs">
                        {selectedBook.uploader.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>{" "}
                      <Badge variant="outline" className="text-xs ml-1">
                        {selectedBook.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>{" "}
                      <span className="font-mono">${selectedBook.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pages:</span>{" "}
                      <span>{selectedBook.pages}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <Badge
                        className={cn(
                          "text-xs ml-1",
                          STATUS_CONFIG[selectedBook.status]?.color,
                          STATUS_CONFIG[selectedBook.status]?.bgColor
                        )}
                      >
                        {STATUS_CONFIG[selectedBook.status]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className={cn(poppins_400.className, "text-sm mt-1")}>
                      {selectedBook.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Rejection Reason */}
              {selectedBook.rejectionReason && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                  <CardContent className="py-4">
                    <p className={cn(poppins_500.className, "text-sm text-red-800 dark:text-red-300 mb-1")}>
                      <XCircle className="h-4 w-4 inline mr-1" />
                      Rejection Reason
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {selectedBook.rejectionReason}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Change Notes */}
              {selectedBook.changeNotes && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                  <CardContent className="py-4">
                    <p className={cn(poppins_500.className, "text-sm text-blue-800 dark:text-blue-300 mb-1")}>
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      Requested Changes
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {selectedBook.changeNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Form */}
              {selectedBook.status === "pending-review" && actionType && (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
                  <CardContent className="py-4 space-y-3">
                    <p className={cn(poppins_500.className, "text-sm text-amber-800 dark:text-amber-300")}>
                      {actionType === "approve" && (
                        <>
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Approve this book? It will become available for purchase.
                        </>
                      )}
                      {actionType === "reject" && (
                        <>
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Reject this book. Please provide a reason.
                        </>
                      )}
                      {actionType === "changes-requested" && (
                        <>
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          Request changes. Describe what needs to be updated.
                        </>
                      )}
                    </p>
                    {(actionType === "reject" || actionType === "changes-requested") && (
                      <div className="space-y-2">
                        <Label className="text-xs">
                          {actionType === "reject" ? "Rejection Reason" : "Change Notes"}
                        </Label>
                        <Textarea
                          placeholder={
                            actionType === "reject"
                              ? "Enter reason for rejection..."
                              : "Describe the changes needed..."
                          }
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dialog Actions */}
              {selectedBook.status === "pending-review" && (
                <DialogFooter className="flex flex-wrap gap-2 sm:justify-start">
                  {!actionType ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction("approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction("reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction("changes-requested")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={confirmAction}
                        disabled={processing || (actionType !== "approve" && !actionNotes.trim())}
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Confirm {actionType === "approve" ? "Approval" : actionType === "reject" ? "Rejection" : "Changes Request"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionType(null);
                          setActionNotes("");
                        }}
                        disabled={processing}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
