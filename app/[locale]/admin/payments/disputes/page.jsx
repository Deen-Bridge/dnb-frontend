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
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  FileText,
  Paperclip,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";
import DisputeEvidenceViewer from "@/components/admin/DisputeEvidenceViewer";
import DisputeEvidenceUpload from "@/components/admin/DisputeEvidenceUpload";

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
    buyerStatement: "I purchased this course but the video lectures won't load. Requesting a full refund.",
    educatorStatement: "The course content is fully functional. The buyer may have connectivity issues.",
    evidenceList: [
      {
        id: "ev_001_1",
        fileName: "playback_error_screenshot.png",
        fileType: "image/png",
        uploadedAt: "2026-08-22T10:20:00Z",
        senderRole: "buyer",
        note: "Screenshot of black video player error.",
        signedUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    ],
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
    buyerStatement: "The book description said 300 pages but the downloaded PDF is only 50 pages.",
    educatorStatement: "The 300-page count includes appendices and index. The main content is complete.",
    evidenceRequest: { target: "buyer", requestedAt: "2026-08-21T14:00:00Z", message: "Please provide a screenshot of the misleading listing." },
    evidenceList: [
      {
        id: "ev_002_1",
        fileName: "book_toc_sample.pdf",
        fileType: "application/pdf",
        uploadedAt: "2026-08-21T15:00:00Z",
        senderRole: "educator",
        note: "Original table of contents document.",
        signedUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    ],
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
    buyerStatement: "The educator never responded to my questions and the course hasn't been updated.",
    educatorStatement: "I have been on medical leave. I apologize for the lack of communication.",
    resolution: "Full refund issued. Course delisted pending educator return.",
    evidenceList: [],
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

  // Viewer state for secure evidence viewing
  const [viewingEvidence, setViewingEvidence] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

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

  const openEvidenceViewer = (evidence) => {
    setViewingEvidence(evidence);
    setViewerOpen(true);
  };

  const handleAdminEvidenceSuccess = (newEvidence) => {
    if (!selectedDispute) return;
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id
          ? {
              ...d,
              evidenceList: [...(d.evidenceList || []), newEvidence],
            }
          : d
      )
    );
    setSelectedDispute((prev) =>
      prev
        ? {
            ...prev,
            evidenceList: [...(prev.evidenceList || []), newEvidence],
          }
        : prev
    );
  };

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
        subtitle="Manage buyer vs educator payment disputes with secure evidence viewing"
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
                  <TableHead>Attachments</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No disputes found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDisputes.map((dispute) => {
                    const stateConfig = DISPUTE_STATES[dispute.state];
                    const evidenceCount = dispute.evidenceList?.length || 0;

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
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {evidenceCount} {evidenceCount === 1 ? "file" : "files"}
                            </span>
                          </div>
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
                                View Details & Evidence
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestEvidence(dispute.id, "buyer");
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Request Evidence from Buyer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestEvidence(dispute.id, "educator");
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Request Evidence from Educator
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDisputeState(
                                    dispute.id,
                                    "resolved-refund",
                                    "Full refund issued after review."
                                  );
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolve with Refund
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDisputeState(
                                    dispute.id,
                                    "resolved-rejected",
                                    "Dispute rejected after review."
                                  );
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Dispute
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

      {/* Detail & Evidence Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedDispute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Dispute Detail: {selectedDispute.id}
                </DialogTitle>
                <DialogDescription>
                  Opened {formatDate(selectedDispute.openedAt)} &middot;{" "}
                  {formatAge(selectedDispute.openedAt)}
                </DialogDescription>
            <div className="print-root space-y-4">
              <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Dispute {selectedDispute.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Opened {formatDate(selectedDispute.openedAt)} &middot;{" "}
                    {formatAge(selectedDispute.openedAt)}
                  </DialogDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="no-print gap-1.5 text-xs font-semibold mr-6"
                  aria-label="Print record"
                >
                  <Printer className="h-4 w-4" />
                  Print Record
                </Button>
              </DialogHeader>

              {/* Linked Transaction Info */}
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Tx Reference</span>
                      <span className="font-mono font-semibold">{selectedDispute.transactionId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Amount</span>
                      <span className="font-mono font-semibold">${selectedDispute.amount.toFixed(2)} USDC</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Item</span>
                      <span className="font-medium truncate">{selectedDispute.item.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Status</span>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          DISPUTE_STATES[selectedDispute.state]?.color,
                          DISPUTE_STATES[selectedDispute.state]?.bgColor
                        )}
                      >
                        {DISPUTE_STATES[selectedDispute.state]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {selectedDispute.buyer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      Buyer Statement ({selectedDispute.buyer.name})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDispute.buyer.name} &middot;{" "}
                      <a href={`mailto:${selectedDispute.buyer.email}`} className="text-primary hover:underline print-url">
                        {selectedDispute.buyer.email}
                      </a>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedDispute.buyerStatement}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {selectedDispute.educator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      Educator Statement ({selectedDispute.educator.name})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDispute.educator.name} &middot;{" "}
                      <a href={`mailto:${selectedDispute.educator.email}`} className="text-primary hover:underline print-url">
                        {selectedDispute.educator.email}
                      </a>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedDispute.educatorStatement}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Attachments Section (#284) */}
              <Card className="border">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      Dispute Evidence & Attachments ({selectedDispute.evidenceList?.length || 0})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Secure expiring-URL attachments uploaded by buyer, educator, or admin.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Protected URLs</span>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 space-y-3">
                  {!selectedDispute.evidenceList || selectedDispute.evidenceList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No evidence attachments submitted yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDispute.evidenceList.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col justify-between p-3 rounded-lg border bg-card hover:border-primary/40 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.fileType?.includes("pdf") || item.fileName?.endsWith(".pdf") ? (
                                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                )}
                                <p className="font-medium text-xs truncate" title={item.fileName}>
                                  {item.fileName}
                                </p>
                              </div>

                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold py-0 px-1.5 capitalize"
                              >
                                {item.senderRole}
                              </Badge>
                            </div>

                            {item.note && (
                              <p className="text-[11px] text-muted-foreground italic line-clamp-2">
                                &ldquo;{item.note}&rdquo;
                              </p>
                            )}

                            <p className="text-[10px] text-muted-foreground">
                              Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="pt-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs h-7 gap-1.5"
                              onClick={() => openEvidenceViewer(item)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Secure Evidence
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Upload Slot */}
                  <div className="pt-2">
                    <DisputeEvidenceUpload
                      disputeId={selectedDispute.id}
                      onUploadSuccess={handleAdminEvidenceSuccess}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resolution / Actions */}
              {selectedDispute.state === "open" ||
              selectedDispute.state === "awaiting-evidence" ? (
                <DialogFooter className="flex flex-wrap gap-2 sm:justify-start pt-2">
                <DialogFooter className="no-print flex flex-wrap gap-2 sm:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestEvidence(selectedDispute.id, "buyer")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request Evidence from Buyer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      requestEvidence(selectedDispute.id, "educator")
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request Evidence from Educator
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      updateDisputeState(
                        selectedDispute.id,
                        "resolved-refund",
                        "Full refund issued after review."
                      )
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve with Refund
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Secure Evidence Viewer Dialog */}
      {selectedDispute && viewingEvidence && (
        <DisputeEvidenceViewer
          disputeId={selectedDispute.id}
          evidence={viewingEvidence}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </PageShell>
  );
}

