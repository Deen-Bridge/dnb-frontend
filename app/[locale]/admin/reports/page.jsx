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

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";

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

// Report reason categories
const REASON_CATEGORIES = {
  spam: "Spam",
  harassment: "Harassment",
  inappropriate: "Inappropriate Content",
  copyright: "Copyright Violation",
  misinformation: "Misinformation",
  hate_speech: "Hate Speech",
  violence: "Violence",
  other: "Other",
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
      reportCount: 1 + Math.floor(Math.random() * 15),
      description: `Reported for ${REASON_CATEGORIES[reason].toLowerCase()} - ${target.name}`,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const mockReports = generateMockReports();

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

function UnifiedReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get("status");
    return s && Object.keys(REPORT_STATUSES).includes(s) ? s : "open";
  });
  const [typeFilter, setTypeFilter] = useState(() => {
    const t = searchParams.get("type");
    return t && Object.keys(CONTENT_TYPES).includes(t) ? t : "all";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tableRef = useRef(null);
  const pageSize = 15;

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
            handleStatusChange(reports[selectedIndex].id, "dismissed");
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, reports.length - 1));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [reports, selectedIndex]);

  // Fetch reports with filters
  const fetchReports = useCallback(async (page, filters) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

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
    setLoading(false);
    setSelectedIndex(0);
  }, []);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchReports(currentPage, { status: statusFilter, type: typeFilter });
  }, [fetchReports, currentPage, statusFilter, typeFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  // Keep URL in sync so filters are deep-linkable (?status=&type=)
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "open") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    const qs = params.toString();
    router.replace(qs ? `/admin/reports?${qs}` : "/admin/reports", { scroll: false });
  }, [router, statusFilter, typeFilter]);

  // Handle status change
  const handleStatusChange = useCallback((reportId, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchReports(currentPage, { status: statusFilter, type: typeFilter });
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
      <PageHeader
        icon={Flag}
        title="Reports Queue"
        subtitle="Unified moderation queue for all content types"
        actions={
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono bg-muted rounded">
              j/k to navigate
            </kbd>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
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

            {/* Content Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
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
          <div className="rounded-lg border" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Reporter</TableHead>
                  <TableHead className="w-[250px]">Target</TableHead>
                  <TableHead className="w-[150px]">Reason</TableHead>
                  <TableHead className="w-[90px]">Reports</TableHead>
                  <TableHead className="w-[100px]">Age</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Assignee</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No reports found</p>
                    </TableCell>
                  </TableRow>
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
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </Link>
                        </TableCell>

                        {/* Reason */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {REASON_CATEGORIES[report.reason]}
                          </Badge>
                        </TableCell>

                        {/* Report Count */}
                        <TableCell className="text-xs text-muted-foreground">
                          ×{report.reportCount}
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
                              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(report.id, "in-review")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark In Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(report.id, "resolved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(report.id, "dismissed")}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className={cn(poppins_400.className, "text-sm text-muted-foreground")}>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts help */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
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
    </PageShell>
  );
}

export default function UnifiedReportsPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedReportsContent />
    </Suspense>
  );
}
