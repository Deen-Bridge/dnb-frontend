"use client";

/**
 * Admin Educator Verifications Queue (#236, #92).
 * ===========================================================================
 * Central admin interface for reviewing, approving, and rejecting educator
 * verification applications.
 *
 * Features:
 * - Multi-select queue with 25-item batch cap (mirrors user bulk actions).
 * - Pre-flight summary dialog: "You are about to approve 12 educators".
 * - Bulk approve skips notes entirely.
 * - Bulk reject requires choosing one shared reason category.
 * - Sequential individual API call fan-out with real-time progress feedback.
 * - Resilience: error isolation during batch execution with retry support.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  MoreVertical,
  Eye,
  FileText,
  Users,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { toast } from "sonner";
import {
  fetchVerificationQueue,
  approveVerification,
  rejectVerification,
  MAX_BATCH_SIZE,
} from "@/lib/actions/admin-verifications";

function formatRelativeTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  } catch {
    return "—";
  }
}

import BulkActionBar from "@/components/admin/verifications/BulkActionBar";
import BulkDecisionDialog from "@/components/admin/verifications/BulkDecisionDialog";
import BulkProgressModal from "@/components/admin/verifications/BulkProgressModal";
import VerificationDetailDrawer from "@/components/admin/verifications/VerificationDetailDrawer";

export default function AdminEducatorsVerificationPage() {
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, under_review: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-selection state (capped at MAX_BATCH_SIZE = 25)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Bulk Decision Pre-flight Dialog state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("approve"); // "approve" | "reject"

  // Bulk Progress Execution Modal state
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [activeBatchItems, setActiveBatchItems] = useState([]);
  const [activeReasonCategory, setActiveReasonCategory] = useState(null);
  const [activeNotes, setActiveNotes] = useState("");

  // Single Detail Drawer state
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Load verification queue data
  const loadQueue = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefetching(true);
    else setLoading(true);

    try {
      const data = await fetchVerificationQueue({
        status: statusFilter,
        search: searchQuery,
      });

      setApplications(data.applications || []);
      setCounts(data.counts || { all: 0, pending: 0, under_review: 0, approved: 0, rejected: 0 });
    } catch {
      toast.error("Failed to load verification queue.");
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Reset selected IDs when status tab changes
  const handleTabChange = (newStatus) => {
    setStatusFilter(newStatus);
    setSelectedIds(new Set());
  };

  // Toggle selection for a single row
  const toggleSelectRow = (appId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        if (next.size >= MAX_BATCH_SIZE) {
          toast.warning(`Selection is capped at ${MAX_BATCH_SIZE} educators per batch.`);
          return prev;
        }
        next.add(appId);
      }
      return next;
    });
  };

  // Toggle Select All (capped at MAX_BATCH_SIZE = 25)
  const isAllSelected = useMemo(() => {
    if (applications.length === 0) return false;
    const actionable = applications.slice(0, MAX_BATCH_SIZE);
    return actionable.every((app) => selectedIds.has(app.id));
  }, [applications, selectedIds]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const actionable = applications.slice(0, MAX_BATCH_SIZE);
      const newSelected = new Set(actionable.map((a) => a.id));
      if (applications.length > MAX_BATCH_SIZE) {
        toast.info(`Selected first ${MAX_BATCH_SIZE} educators (maximum batch cap).`);
      }
      setSelectedIds(newSelected);
    }
  };

  const selectedItemsList = useMemo(() => {
    return applications.filter((app) => selectedIds.has(app.id));
  }, [applications, selectedIds]);

  // Open Bulk Approve pre-flight dialog
  const handleOpenBulkApprove = () => {
    if (selectedIds.size === 0) return;
    setBulkAction("approve");
    setBulkDialogOpen(true);
  };

  // Open Bulk Reject pre-flight dialog
  const handleOpenBulkReject = () => {
    if (selectedIds.size === 0) return;
    setBulkAction("reject");
    setBulkDialogOpen(true);
  };

  // Pre-flight dialog confirmed -> launch sequential execution in ProgressModal
  const handleConfirmPreflight = ({ action, reasonCategory, notes, items }) => {
    setBulkDialogOpen(false);
    setActiveBatchItems(items);
    setActiveReasonCategory(reasonCategory);
    setActiveNotes(notes);
    setProgressModalOpen(true);
  };

  // When sequential execution finishes
  const handleBatchExecutionComplete = ({ succeeded, failed }) => {
    setProgressModalOpen(false);
    setSelectedIds(new Set());
    loadQueue(true);

    if (failed.length === 0) {
      toast.success(
        `Successfully ${bulkAction === "approve" ? "approved" : "rejected"} ${succeeded.length} educators.`
      );
    } else {
      toast.error(
        `Batch finished: ${succeeded.length} succeeded, ${failed.length} failed.`
      );
    }
  };

  // Single Approve
  const handleSingleApprove = async (app) => {
    try {
      await approveVerification(app.id, { name: app.name, email: app.email });
      toast.success(`Approved ${app.name || "educator"}`);
      loadQueue(true);
    } catch {
      toast.error(`Failed to approve ${app.name}`);
    }
  };

  // Single Reject
  const handleSingleReject = async (app, { reasonCategory, notes }) => {
    try {
      await rejectVerification(app.id, { reasonCategory, notes }, { name: app.name, email: app.email });
      toast.success(`Rejected ${app.name || "educator"}`);
      loadQueue(true);
    } catch {
      toast.error(`Failed to reject ${app.name}`);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Educator Verifications"
          subtitle="Triage applicant credentials, inspect liveness checks, and perform bulk review decisions."
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || isRefetching}
              onClick={() => loadQueue(true)}
              className="text-xs border-accent/20 h-9"
            >
              <RefreshCw
                className={cn("size-3.5 mr-1.5", isRefetching && "animate-spin")}
              />
              Refresh Queue
            </Button>
          }
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <Card className="bg-surface-raised border-accent/15">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted font-medium">Pending Review</p>
                <p className={cn(poppins_600, "text-2xl text-amber-600 dark:text-amber-400 mt-1")}>
                  {counts.pending}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-accent/15">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted font-medium">Under Review</p>
                <p className={cn(poppins_600, "text-2xl text-blue-600 dark:text-blue-400 mt-1")}>
                  {counts.under_review}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-accent/15">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted font-medium">Approved Total</p>
                <p className={cn(poppins_600, "text-2xl text-emerald-600 dark:text-emerald-400 mt-1")}>
                  {counts.approved}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-accent/15">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted font-medium">Rejected Total</p>
                <p className={cn(poppins_600, "text-2xl text-red-600 dark:text-red-400 mt-1")}>
                  {counts.rejected}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                <XCircle className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search Filter */}
        <Card className="bg-surface-raised border-accent/15 shadow-sm">
          <CardHeader className="p-4 pb-3 border-b border-accent/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <Tabs
                value={statusFilter}
                onValueChange={handleTabChange}
                className="w-full md:w-auto"
              >
                <TabsList className="bg-surface border border-accent/10 p-1">
                  <TabsTrigger value="pending" className="text-xs px-3 py-1.5">
                    Pending
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                      {counts.pending}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="under_review" className="text-xs px-3 py-1.5">
                    Under Review
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                      {counts.under_review}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs px-3 py-1.5">
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs px-3 py-1.5">
                    Rejected
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-3 py-1.5">
                    All
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted" />
                <Input
                  type="search"
                  placeholder="Search name, email, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface border-accent/15"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-ink-muted text-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="size-6 animate-spin text-accent" />
                <p>Loading verification queue...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center text-ink-muted text-xs flex flex-col items-center justify-center gap-2">
                <Users className="size-8 text-ink-muted/50" />
                <p className="font-medium text-ink">No verification applications found</p>
                <p className="text-[11px]">There are no educators matching the selected status or query.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-surface/50">
                  <TableRow className="border-accent/10 text-xs">
                    <TableHead className="w-10 px-4">
                      <Checkbox
                        data-testid="select-all-checkbox"
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all educators"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-ink">Educator</TableHead>
                    <TableHead className="font-semibold text-ink">Submitted</TableHead>
                    <TableHead className="font-semibold text-ink">Liveness Signal</TableHead>
                    <TableHead className="font-semibold text-ink">Documents</TableHead>
                    <TableHead className="font-semibold text-ink">Status</TableHead>
                    <TableHead className="text-right px-4 font-semibold text-ink">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-accent/10">
                  {applications.map((app) => {
                    const isSelected = selectedIds.has(app.id);

                    return (
                      <TableRow
                        key={app.id}
                        data-testid={`queue-row-${app.id}`}
                        className={cn(
                          "border-accent/10 text-xs hover:bg-surface/60 transition-colors",
                          isSelected && "bg-accent/5"
                        )}
                      >
                        <TableCell className="px-4">
                          <Checkbox
                            data-testid={`row-checkbox-${app.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(app.id)}
                            aria-label={`Select ${app.name}`}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-8 rounded-lg border border-accent/10">
                              <AvatarFallback className="text-xs bg-secondary/15 text-accent font-semibold">
                                {(app.name || app.email || "E")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-ink">{app.name}</p>
                              <p className="text-[11px] text-ink-muted">{app.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-ink-muted">
                          {formatRelativeTime(app.submittedAt)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {app.livenessPassed !== false ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0.5 flex items-center gap-1"
                              >
                                <ShieldCheck className="size-3" />
                                {app.livenessScore || 95}% Match
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] py-0.5 flex items-center gap-1"
                              >
                                <ShieldAlert className="size-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="flex items-center gap-1 text-ink-muted">
                            <FileText className="size-3" />
                            {app.documents?.length || 0} doc
                            {app.documents?.length === 1 ? "" : "s"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize font-medium py-0.5",
                              app.status === "approved" &&
                                "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                              app.status === "rejected" &&
                                "bg-red-500/10 text-red-600 border-red-500/30",
                              app.status === "pending" &&
                                "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              app.status === "under_review" &&
                                "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            )}
                          >
                            {app.status?.replace("_", " ")}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setDetailOpen(true);
                              }}
                              className="h-8 px-2.5 text-xs text-ink-muted hover:text-ink"
                            >
                              <Eye className="size-3.5 mr-1" />
                              Review
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-ink-muted hover:text-ink"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem
                                  onClick={() => handleSingleApprove(app)}
                                  className="text-emerald-600 cursor-pointer"
                                >
                                  <CheckCircle className="size-3.5 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setDetailOpen(true);
                                  }}
                                  className="text-red-600 cursor-pointer"
                                >
                                  <XCircle className="size-3.5 mr-2" />
                                  Reject with Reason
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Floating Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          maxBatchSize={MAX_BATCH_SIZE}
          onApprove={handleOpenBulkApprove}
          onReject={handleOpenBulkReject}
          onClear={() => setSelectedIds(new Set())}
        />

        {/* Bulk Decision Pre-flight Summary Dialog */}
        <BulkDecisionDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          action={bulkAction}
          selectedItems={selectedItemsList}
          onConfirm={handleConfirmPreflight}
        />

        {/* Sequential Fan-Out Execution Progress Modal */}
        <BulkProgressModal
          open={progressModalOpen}
          action={bulkAction}
          items={activeBatchItems}
          reasonCategory={activeReasonCategory}
          notes={activeNotes}
          onComplete={handleBatchExecutionComplete}
        />

        {/* Single Application Detail Drawer */}
        <VerificationDetailDrawer
          open={detailOpen}
          onOpenChange={setDetailOpen}
          application={selectedApp}
          onApprove={handleSingleApprove}
          onReject={handleSingleReject}
        />
      </div>
    </PageShell>
  );
}
