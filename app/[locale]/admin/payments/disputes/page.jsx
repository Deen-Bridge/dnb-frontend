"use client";

import { useState, useMemo, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  MoreVertical,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";
import StepUpConfirmModal from "@/components/admin/StepUpConfirmModal";
import { toast } from "sonner";

const DISPUTE_STATES = {
  open: {
    label: "Open",
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  "awaiting-evidence": {
    label: "Awaiting Evidence",
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  "resolved-refund": {
    label: "Resolved (Refund)",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  "resolved-rejected": {
    label: "Resolved (Rejected)",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
  },
};

const mockDisputes = [
  {
    id: "dsp_001",
    openedAt: "2026-08-22T10:15:00Z",
    buyer: { id: "usr_b1", name: "Ahmad Patel", email: "ahmad@example.com" },
    educator: { id: "usr_e1", name: "Sheikh Ibrahim", email: "ibrahim@example.com" },
    item: { type: "course", name: "Advanced Tajweed Course", id: "crs_101" },
    amount: 49.99,
    transactionId: "PLT-10042",
    state: "open",
    buyerStatement: "I purchased this course but the video lectures won't load. I've tried multiple devices and browsers. Requesting a full refund.",
    educatorStatement: "The course content is fully functional. The buyer may have connectivity issues. I've offered to troubleshoot but haven't received a response.",
  },
  {
    id: "dsp_002",
    openedAt: "2026-08-20T08:30:00Z",
    buyer: { id: "usr_b2", name: "Fatima Al-Rashid", email: "fatima@example.com" },
    educator: { id: "usr_e2", name: "Dr. Amina Yusuf", email: "amina@example.com" },
    item: { type: "book", name: "Seerah Illustrated", id: "bk_205" },
    amount: 12.50,
    transactionId: "PLT-10038",
    state: "awaiting-evidence",
    buyerStatement: "The book description said 300 pages but the downloaded PDF is only 50 pages. This is misleading.",
    educatorStatement: "The 300-page count includes appendices and index. The main content is complete. I can provide a table of contents screenshot.",
    evidenceRequest: { target: "buyer", requestedAt: "2026-08-21T14:00:00Z", message: "Please provide a screenshot of the misleading listing." },
  },
  {
    id: "dsp_003",
    openedAt: "2026-08-18T16:45:00Z",
    buyer: { id: "usr_b3", name: "Yusuf Khan", email: "yusuf@example.com" },
    educator: { id: "usr_e3", name: "Ustadh Omar Ali", email: "omar@example.com" },
    item: { type: "course", name: "Quran Memorization Plan", id: "crs_112" },
    amount: 75.00,
    transactionId: "PLT-10035",
    state: "resolved-refund",
    buyerStatement: "The educator never responded to my questions and the course hasn't been updated in 6 months.",
    educatorStatement: "I have been on medical leave. I apologize for the lack of communication.",
    resolution: "Full refund issued. Course delisted pending educator return.",
  },
  {
    id: "dsp_004",
    openedAt: "2026-08-15T12:00:00Z",
    buyer: { id: "usr_b4", name: "Maryam Hassan", email: "maryam@example.com" },
    educator: { id: "usr_e4", name: "Sheikh Ahmad Darwish", email: "ahmad.d@example.com" },
    item: { type: "course", name: "Fiqh of Worship", id: "crs_108" },
    amount: 35.00,
    transactionId: "PLT-10030",
    state: "resolved-rejected",
    buyerStatement: "I changed my mind after 2 hours. I want a refund.",
    educatorStatement: "The course was fully delivered and the buyer accessed all content. The no-refund policy was clearly stated.",
    resolution: "Dispute rejected. Buyer accessed complete course content within the stated terms.",
  },
  {
    id: "dsp_005",
    openedAt: "2026-08-24T09:20:00Z",
    buyer: { id: "usr_b5", name: "Omar Siddiqui", email: "omar.s@example.com" },
    educator: { id: "usr_e5", name: "Dr. Khadija Noor", email: "khadija@example.com" },
    item: { type: "course", name: "Arabic Grammar Basics", id: "crs_120" },
    amount: 29.99,
    transactionId: "PLT-10045",
    state: "open",
    buyerStatement: "I was charged twice for the same course. My bank statement shows two $29.99 charges.",
    educatorStatement: "I only received one payment. This may be a platform issue.",
  },
  {
    id: "dsp_006",
    openedAt: "2026-08-21T14:10:00Z",
    buyer: { id: "usr_b6", name: "Zainab Ali", email: "zainab@example.com" },
    educator: { id: "usr_e6", name: "Imam Hassan Malik", email: "hassan@example.com" },
    item: { type: "book", name: "Daily Adhkar Collection", id: "bk_210" },
    amount: 8.00,
    transactionId: "PLT-10041",
    state: "awaiting-evidence",
    buyerStatement: "The book is full of typos and formatting issues. Not worth the price.",
    educatorStatement: "The book has been professionally edited. The buyer may have a corrupted download.",
    evidenceRequest: { target: "educator", requestedAt: "2026-08-22T10:00:00Z", message: "Please provide the original manuscript or proof of professional editing." },
  },
  {
    id: "dsp_007",
    openedAt: "2026-08-19T11:30:00Z",
    buyer: { id: "usr_b7", name: "Ibrahim Syed", email: "ibrahim.s@example.com" },
    educator: { id: "usr_e7", name: "Ustadha Maryam J.", email: "maryam.j@example.com" },
    item: { type: "course", name: "Kids Quran Reading", id: "crs_115" },
    amount: 19.99,
    transactionId: "PLT-10036",
    state: "open",
    buyerStatement: "The course is listed for ages 5-10 but the content is way too advanced for young children.",
    educatorStatement: "The age range is stated in the description. The first lesson is an assessment to gauge the child's level.",
  },
];

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

export default function DisputesPage() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Refund Step-Up Modal State (#311)
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundTargetDispute, setRefundTargetDispute] = useState(null);

  const filteredDisputes = useMemo(() => {
    if (statusFilter === "all") return disputes;
    return disputes.filter((d) => d.state === statusFilter);
  }, [disputes, statusFilter]);

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const paginatedDisputes = filteredDisputes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusCounts = useMemo(() => {
    const counts = {};
    Object.keys(DISPUTE_STATES).forEach((key) => {
      counts[key] = disputes.filter((d) => d.state === key).length;
    });
    return counts;
  }, [disputes]);

  const openDetail = useCallback((dispute) => {
    setSelectedDispute(dispute);
    setDetailOpen(true);
  }, []);

  const updateDisputeState = useCallback((disputeId, newState, resolution) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, state: newState, ...(resolution ? { resolution } : {}) }
          : d
      )
    );
    setSelectedDispute((prev) =>
      prev?.id === disputeId
        ? { ...prev, state: newState, ...(resolution ? { resolution } : {}) }
        : prev
    );
  }, []);

  const handleTriggerRefundStepUp = (dispute) => {
    setRefundTargetDispute(dispute);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundTargetDispute) return;
    updateDisputeState(
      refundTargetDispute.id,
      "resolved-refund",
      "Full refund issued after step-up verification."
    );
    toast.success(`Refund authorized for transaction ${refundTargetDispute.transactionId}`);
  };

  const requestEvidence = useCallback((disputeId, target) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              state: "awaiting-evidence",
              evidenceRequest: {
                target,
                requestedAt: new Date().toISOString(),
                message: `Please provide supporting evidence for this dispute.`,
              },
            }
          : d
      )
    );
    setDetailOpen(false);
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={AlertTriangle}
        title="Disputes Queue"
        subtitle="Manage buyer vs educator payment disputes with step-up verification"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisputes([...mockDisputes])}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  {disputes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="open" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Open
                <Badge variant="secondary" className="ml-1">
                  {statusCounts.open || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="awaiting-evidence" className="gap-2">
                <Clock className="h-4 w-4" />
                Awaiting Evidence
                <Badge variant="secondary" className="ml-1">
                  {statusCounts["awaiting-evidence"] || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved-refund" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Refunded
                <Badge variant="secondary" className="ml-1">
                  {statusCounts["resolved-refund"] || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved-rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
                <Badge variant="secondary" className="ml-1">
                  {statusCounts["resolved-rejected"] || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Disputes ({filteredDisputes.length})
          </CardTitle>
          <CardDescription>
            Buyer vs educator payment disputes requiring review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table aria-label="Disputes List Table">
              <TableHeader>
                <TableRow>
                  <TableHead>Opened</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Educator</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No disputes found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDisputes.map((dispute) => {
                    const stateConfig = DISPUTE_STATES[dispute.state];
                    return (
                      <TableRow
                        key={dispute.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetail(dispute)}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatDate(dispute.openedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">
                                {dispute.buyer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{dispute.buyer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">
                                {dispute.educator.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{dispute.educator.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-xs mr-2">
                              {dispute.item.type}
                            </Badge>
                            <span className="text-sm">{dispute.item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${dispute.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              stateConfig?.color,
                              stateConfig?.bgColor
                            )}
                          >
                            {stateConfig?.label}
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
                                  openDetail(dispute);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTriggerRefundStepUp(dispute);
                                }}
                                disabled={dispute.state.startsWith("resolved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Resolve with Refund
                              </DropdownMenuItem>
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
          {selectedDispute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Dispute {selectedDispute.id}
                </DialogTitle>
                <DialogDescription>
                  Opened {formatDate(selectedDispute.openedAt)} &middot;{" "}
                  {formatAge(selectedDispute.openedAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Buyer: {selectedDispute.buyer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{selectedDispute.buyerStatement}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Educator: {selectedDispute.educator.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{selectedDispute.educatorStatement}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Resolution Actions */}
              {selectedDispute.state === "open" || selectedDispute.state === "awaiting-evidence" ? (
                <DialogFooter className="flex flex-wrap gap-2 sm:justify-start pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleTriggerRefundStepUp(selectedDispute)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve with Refund (Step-Up)
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      updateDisputeState(
                        selectedDispute.id,
                        "resolved-rejected",
                        "Dispute rejected after review."
                      )
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Dispute
                  </Button>
                </DialogFooter>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Step-Up Confirmation Modal (#311) */}
      {refundTargetDispute && (
        <StepUpConfirmModal
          open={refundModalOpen}
          onOpenChange={setRefundModalOpen}
          title="Confirm Refund Authorization"
          description={`Issuing a refund for transaction ${refundTargetDispute.transactionId} will credit $${refundTargetDispute.amount.toFixed(2)} USDC back to the buyer and resolve this dispute.`}
          targetName={refundTargetDispute.transactionId}
          actionVerb="REFUND"
          expectedPhrase={`REFUND ${refundTargetDispute.transactionId}`}
          confirmVariant="destructive"
          confirmText="Process Refund"
          onConfirm={handleConfirmRefund}
          rateLimitKey="admin_dispute_refund"
        />
      )}
    </PageShell>
  );
}
