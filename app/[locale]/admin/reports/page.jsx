"use client";

/**
 * Unified Reports Queue (#288)
 *
 * Consolidates moderation flags from multiple content types (courses, books,
 * reels, spaces, users) into a single triage interface to streamline
 * moderator workflow.
 *
 * Features:
 * - Status tabs: open, in-review, resolved, dismissed
 * - Secondary filter by content type
 * - Keyboard-first list navigation (j/k to navigate, enter to open)
 * - Deep links to underlying entity admin pages
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Flag,
  GraduationCap,
  BookOpen,
  Video,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Plus,
  Settings2,
  ArrowUp,
  ArrowDown,
  Merge,
  Trash2,
  Loader2,
} from "lucide-react";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { TableEmptyState } from "@/components/admin/table-empty-state";
import { TableErrorState } from "@/components/admin/table-error-state";
import { RefetchBanner } from "@/components/admin/refetch-banner";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";
import DismissReportDialog from "@/components/admin/DismissReportDialog";
import BlurImage from "@/components/ui/blur-image";
import MediaBlurToggle from "@/components/admin/MediaBlurToggle";

// Content type definitions with icons and colors
const CONTENT_TYPES = {
  course: {
    label: "Course",
    icon: GraduationCap,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    adminPath: "/admin/courses",
  },
  book: {
    label: "Book",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    adminPath: "/admin/books",
  },
  reel: {
    label: "Reel",
    icon: Video,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    adminPath: "/admin/reels",
  },
  space: {
    label: "Space",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    adminPath: "/admin/spaces",
  },
  user: {
    label: "User",
    icon: User,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    adminPath: "/admin/users",
  },
};

// Report status definitions
const REPORT_STATUSES = {
  open: {
    label: "Open",
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  "in-review": {
    label: "In Review",
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  dismissed: {
    label: "Dismissed",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
  },
};

// Report reason taxonomy management
// Centralized source of truth for report reasons, consumed by admin and learner-facing dialogs.
const REPORT_REASON_GROUPS = [
  {
    id: "harassment",
    label: "Harassment",
    description: "Content that harasses, intimidates, or bullies others.",
    reasons: [
      { id: "harassment", label: "Harassment" },
      { id: "hate_speech", label: "Hate Speech" },
      { id: "violence", label: "Violence or Threats" },
    ],
  },
  {
    id: "copyright",
    label: "Copyright",
    description: "Content that infringes on intellectual property rights.",
    reasons: [{ id: "copyright", label: "Copyright Violation" }],
  },
  {
    id: "misinformation",
    label: "Misinformation",
    description: "False or misleading information.",
    reasons: [{ id: "misinformation", label: "Misinformation" }],
  },
  {
    id: "spam",
    label: "Spam",
    description: "Unsolicited promotional or repetitive content.",
    reasons: [{ id: "spam", label: "Spam" }],
  },
  {
    id: "other",
    label: "Other",
    description: "Any other reason not covered by the above categories.",
    reasons: [
      { id: "other", label: "Other" },
      { id: "inappropriate", label: "Inappropriate Content" },
    ],
  },
];

// Flat map for backward compatibility with the mock/report rendering.
const REASON_CATEGORIES = Object.fromEntries(
  REPORT_REASON_GROUPS.flatMap((group) =>
    group.reasons.map((reason) => [reason.id, reason.label])
  )
);

// Redirects map to preserve historical data when a reason is merged.
const REASON_REDIRECTS = {};

// Resolve a reason to its effective (non-redirected) ID.
const getEffectiveReason = (reasonId) => {
  let effective = reasonId;
  const visited = new Set();
  while (REASON_REDIRECTS[effective] && !visited.has(effective)) {
    visited.add(effective);
    effective = REASON_REDIRECTS[effective];
  }
  return effective;
};

// Generate mock reports for demo
const generateMockReports = () => {
  const contentTypes = Object.keys(CONTENT_TYPES);
  const statuses = Object.keys(REPORT_STATUSES);
  const reasons = Object.keys(REASON_CATEGORIES);

  const targets = [
    { type: "course", id: "crs_123", name: "Introduction to Fiqh", author: "Sheikh Ahmad" },
    { type: "course", id: "crs_456", name: "Tajweed Mastery", author: "Ustadh Ibrahim" },
    { type: "book", id: "bk_789", name: "Understanding Hadith", author: "Dr. Fatima" },
    { type: "book", id: "bk_012", name: "Seerah Guide", author: "Sheikh Omar" },
    { type: "reel", id: "rl_345", name: "Quick Dua Tip", author: "Aminah M." },
    { type: "reel", id: "rl_678", name: "Recitation Lesson", author: "Yusuf K." },
    { type: "space", id: "sp_901", name: "Tajweed Study Group", owner: "Community Lead" },
    { type: "space", id: "sp_234", name: "Quran Memorization Circle", owner: "Hafiz Academy" },
    { type: "user", id: "usr_567", name: "suspicious_user_23", profile: "New account" },
    { type: "user", id: "usr_890", name: "marketing_account", profile: "Promotional content" },
  ];

  const reporters = [
    { id: "rp_1", name: "Sarah A.", avatar: null },
    { id: "rp_2", name: "Mohammed B.", avatar: null },
    { id: "rp_3", name: "Khadija C.", avatar: null },
    { id: "rp_4", name: "Ali D.", avatar: null },
    { id: "rp_5", name: "Maryam E.", avatar: null },
  ];

  const assignees = [
    { id: "mod_1", name: "Admin Team", avatar: null },
    { id: "mod_2", name: "Moderator Ali", avatar: null },
    { id: "mod_3", name: "Moderator Fatima", avatar: null },
    null, // Unassigned
  ];

  const reports = [];
  const now = new Date();

  for (let i = 0; i < 75; i++) {
    const target = targets[Math.floor(Math.random() * targets.length)];
    const reporter = reporters[Math.floor(Math.random() * reporters.length)];
    const assignee = assignees[Math.floor(Math.random() * assignees.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    reports.push({
      id: `rpt_${i.toString().padStart(4, "0")}`,
      target,
      reporter,
      assignee,
      status,
      reason,
      description: `Reported for ${REASON_CATEGORIES[getEffectiveReason(reason)].toLowerCase()} - ${target.name}`,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const mockReports = generateMockReports();

const ReasonManagementDialog = ({ open, onClose }) => {
  const [groups, setGroups] = useState(() =>
    REPORT_REASON_GROUPS.map((group) => ({
      ...group,
      reasons: group.reasons.map((r) => ({ ...r })),
    }))
  );
  const [redirects, setRedirects] = useState(REASON_REDIRECTS);

  const handleUpdateReason = (groupId, reasonId, newLabel) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              reasons: g.reasons.map((r) =>
                r.id === reasonId ? { ...r, label: newLabel } : r
              ),
            }
          : g
      )
    );
  };

  const handleAddReason = (groupId) => {
    const newId = `custom_${Date.now()}`;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, reasons: [...g.reasons, { id: newId, label: "New Reason" }] }
          : g
      )
    );
  };

  const handleRemoveReason = (groupId, reasonId) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, reasons: g.reasons.filter((r) => r.id !== reasonId) }
          : g
      )
    );
  };

  const handleMoveReason = (groupId, index, direction) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const reasons = [...g.reasons];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= reasons.length) return g;
        [reasons[index], reasons[targetIndex]] = [reasons[targetIndex], reasons[index]];
        return { ...g, reasons };
      })
    );
  };

  const handleMergeReason = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setRedirects((prev) => ({ ...prev, [sourceId]: targetId }));
  };

  const handleSave = () => {
    // Write changes back to global constants for use by the rest of the app.
    REPORT_REASON_GROUPS.splice(0, REPORT_REASON_GROUPS.length, ...groups);
    // Rebuild flat map
    Object.keys(REASON_CATEGORIES).forEach((key) => delete REASON_CATEGORIES[key]);
    groups.forEach((g) =>
      g.reasons.forEach((r) => {
        REASON_CATEGORIES[r.id] = r.label;
      })
    );
    // Save redirects
    Object.keys(redirects).forEach((key) => {
      REASON_REDIRECTS[key] = redirects[key];
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Report Reasons</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{group.label}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleAddReason(group.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-2 space-y-2">
                {group.reasons.map((reason, index) => (
                  <li key={reason.id} className="flex items-center gap-2">
                    <span className="text-sm">{index + 1}.</span>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={reason.label}
                      onChange={(e) => handleUpdateReason(group.id, reason.id, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveReason(group.id, index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveReason(group.id, index, 1)}
                      disabled={index === group.reasons.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReason(group.id, reason.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Merge Reasons</h4>
          <div className="flex items-center gap-2">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background"
              id="merge-source"
            >
              {groups.flatMap((g) =>
                g.reasons.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)
              )}
            </select>
            <span>into</span>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background"
              id="merge-target"
            >
              {groups.flatMap((g) =>
                g.reasons.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)
              )}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const source = document.getElementById("merge-source").value;
                const target = document.getElementById("merge-target").value;
                handleMergeReason(source, target);
              }}
            >
              <Merge className="h-4 w-4" />
            </Button>
          </div>
          {Object.keys(redirects).length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Active Redirects:</strong>
              <ul className="list-disc pl-5">
                {Object.entries(redirects).map(([from, to]) => (
                  <li key={from}>
                    {from} → {to}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Format report age
const formatReportAge = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

// Get admin link for a target
const getTargetAdminLink = (target) => {
  const type = CONTENT_TYPES[target.type];
  if (!type) return "#";
  return `${type.adminPath}/${target.id}`;
};

export default function UnifiedReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tableRef = useRef(null);
  const pageSize = 15;
  // Dismiss dialog state
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
  const [dismissTarget, setDismissTarget] = useState(null);
  // Reason management dialog state
  const [isReasonManagerOpen, setIsReasonManagerOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "j":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, reports.length - 1));
          break;
        case "k":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (reports[selectedIndex]) {
            const target = reports[selectedIndex].target;
            window.location.href = getTargetAdminLink(target);
          }
          break;
        case "o":
          e.preventDefault();
          if (reports[selectedIndex]) {
            handleStatusChange(reports[selectedIndex].id, "open");
          }
          break;
        case "r":
          e.preventDefault();
          if (reports[selectedIndex]) {
            handleStatusChange(reports[selectedIndex].id, "in-review");
          }
          break;
        case "d":
          e.preventDefault();
          if (reports[selectedIndex]) {
            setDismissTarget(reports[selectedIndex]);
            setIsDismissDialogOpen(true);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [reports, selectedIndex]);

  // Fetch reports with filters
  const fetchReports = useCallback(async (page, filters, isRefetch = false) => {
    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Simulate occasional error for demo
      if (Math.random() < 0.05) {
        throw new Error("Failed to fetch reports");
      }

      let filtered = [...mockReports];

      if (filters.status !== "all") {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters.type !== "all") {
        filtered = filtered.filter((r) => r.target.type === filters.type);
      }

      const total = Math.ceil(filtered.length / pageSize);
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setReports(paginated);
      setTotalPages(total || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefetching(false);
      setSelectedIndex(0);
    }
  }, []);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchReports(currentPage, { status: statusFilter, type: typeFilter });
  }, [fetchReports, currentPage, statusFilter, typeFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  // Handle status change
  const handleStatusChange = useCallback((reportId, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchReports(currentPage, { status: statusFilter, type: typeFilter }, true);
  };

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = { open: 0, "in-review": 0, resolved: 0, dismissed: 0 };
    mockReports.forEach((r) => {
      if (typeFilter === "all" || r.target.type === typeFilter) {
        counts[r.status]++;
      }
    });
    return counts;
  }, [typeFilter]);

  return (
    <PageShell>
      <ReasonManagementDialog
        open={isReasonManagerOpen}
        onClose={() => setIsReasonManagerOpen(false)}
      />
      <PageHeader
        icon={Flag}
        title="Reports Queue"
        subtitle="Unified moderation queue for all content types"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReasonManagerOpen(true)}>
              <Settings2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reasons</span>
            </Button>
            <MediaBlurToggle className="hidden lg:flex" />
            <kbd className="hidden lg:inline-flex px-2 py-1 text-xs font-mono bg-muted rounded">
              j/k to navigate
            </kbd>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 sm:mr-2", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="open" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Open
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.open}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="in-review" className="gap-2">
                    <Eye className="h-4 w-4" />
                    In Review
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts["in-review"]}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Resolved
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.resolved}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="dismissed" className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Dismissed
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.dismissed}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All content types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <type.icon className={cn("h-4 w-4", type.color)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <RefetchBanner isRefetching={isRefetching} />

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {REPORT_STATUSES[statusFilter]?.label || "All"} Reports
          </CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages} ({reports.length} reports)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <TableErrorState message={error} onRetry={handleRefresh} />
          ) : (
            <div className="rounded-lg border overflow-x-auto" ref={tableRef}>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Reporter</TableHead>
                      <TableHead className="w-[250px]">Target</TableHead>
                      <TableHead className="w-[150px]">Reason</TableHead>
                      <TableHead className="w-[100px]">Age</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Assignee</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton rows={5} columns={7} />
                    ) : reports.length === 0 ? (
                      <TableEmptyState
                        icon={Flag}
                        title="No reports found"
                        description="No reports match your current filters. Try adjusting the filters."
                      />
                    ) : (
                      reports.map((report, index) => {
                        const contentType = CONTENT_TYPES[report.target.type];
                        const ContentIcon = contentType?.icon || Flag;
                        const status = REPORT_STATUSES[report.status];
                        const isSelected = index === selectedIndex;

                        return (
                          <TableRow
                            key={report.id}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected && "bg-muted/50 ring-2 ring-primary ring-inset"
                            )}
                            onClick={() => setSelectedIndex(index)}
                          >
                            {/* Reporter */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={report.reporter.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {report.reporter.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {report.reporter.name}
                                </span>
                              </div>
                            </TableCell>

                            {/* Target */}
                            <TableCell>
                              <Link
                                href={getTargetAdminLink(report.target)}
                                className="flex items-center gap-2 hover:underline"
                              >
                                <div
                                  className={cn(
                                    "p-1.5 rounded",
                                    contentType?.bgColor
                                  )}
                                >
                                  <ContentIcon
                                    className={cn("h-4 w-4", contentType?.color)}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {report.target.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {contentType?.label}
                                  </p>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                              </Link>
                            </TableCell>

                            {/* Reason */}
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {REASON_CATEGORIES[report.reason]}
                              </Badge>
                            </TableCell>

                            {/* Age */}
                            <TableCell>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatReportAge(report.createdAt)}
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  status?.bgColor,
                                  status?.color
                                )}
                              >
                                {status?.label}
                              </Badge>
                            </TableCell>

                            {/* Assignee */}
                            <TableCell>
                              {report.assignee ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {report.assignee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">
                                    {report.assignee.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Report actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={getTargetAdminLink(report.target)}>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Target
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(report.id, "in-review")}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Mark In Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(report.id, "resolved")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDismissTarget(report);
                                      setIsDismissDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Dismiss
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y">
                {loading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No reports found</p>
                  </div>
                ) : (
                  reports.map((report, index) => {
                    const contentType = CONTENT_TYPES[report.target.type];
                    const ContentIcon = contentType?.icon || Flag;
                    const status = REPORT_STATUSES[report.status];
                    const isSelected = index === selectedIndex;

                    return (
                      <div
                        key={report.id}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "p-3 cursor-pointer transition-colors",
                          isSelected && "bg-muted/50 ring-2 ring-primary ring-inset"
                        )}
                        onClick={() => setSelectedIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedIndex(index);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage src={report.reporter.avatar} />
                              <AvatarFallback className="text-xs">{report.reporter.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{report.reporter.name}</p>
                              <p className="text-xs text-muted-foreground">{formatReportAge(report.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge className={cn("text-[10px]", status?.bgColor, status?.color)}>{status?.label}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Report actions">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={getTargetAdminLink(report.target)}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Target
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, "in-review")}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark In Review
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, "resolved")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDismissTarget(report);
                                    setIsDismissDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Dismiss
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Link href={getTargetAdminLink(report.target)} className="flex items-center gap-2 hover:underline">
                            <div className={cn("p-1 rounded shrink-0", contentType?.bgColor)}>
                              <ContentIcon className={cn("h-3.5 w-3.5", contentType?.color)} />
                            </div>
                            <p className="text-sm font-medium truncate">{report.target.name}</p>
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          </Link>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{REASON_CATEGORIES[report.reason]}</Badge>
                          {report.assignee && (
                            <span className="text-[10px] text-muted-foreground">→ {report.assignee.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className={cn(poppins_400.className, "text-sm text-muted-foreground")}>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Go to next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts help - hidden on mobile */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg hidden sm:block">
            <p className={cn(poppins_500.className, "text-xs text-muted-foreground mb-2")}>
              Keyboard Shortcuts
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                <kbd className="px-1.5 py-0.5 bg-background rounded border">j</kbd> / <kbd className="px-1.5 py-0.5 bg-background rounded border">k</kbd> Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-background rounded border">Enter</kbd> Open target
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-background rounded border">r</kbd> Mark in review
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-background rounded border">d</kbd> Dismiss
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dismiss Report Dialog */}
      {dismissTarget && (
        <DismissReportDialog
          open={isDismissDialogOpen}
          onOpenChange={(open) => {
            setIsDismissDialogOpen(open);
            if (!open) setDismissTarget(null);
          }}
          report={dismissTarget}
          onDismissed={(reportId) => {
            handleStatusChange(reportId, "dismissed");
          }}
        />
      )}
    </PageShell>
  );
}