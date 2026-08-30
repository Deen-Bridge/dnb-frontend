"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  User,
  GraduationCap,
  CreditCard,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

// Action categories
const ACTION_CATEGORIES = {
  user: { label: "User", icon: User, color: "text-blue-500" },
  course: { label: "Course", icon: GraduationCap, color: "text-purple-500" },
  payment: { label: "Payment", icon: CreditCard, color: "text-green-500" },
  moderation: { label: "Moderation", icon: Shield, color: "text-amber-500" },
  system: { label: "System", icon: Settings, color: "text-gray-500" },
};

// Mock admin actors
const ADMIN_ACTORS = [
  { id: "1", name: "admin@deenbridge.com" },
  { id: "2", name: "moderator@deenbridge.com" },
  { id: "3", name: "support@deenbridge.com" },
  { id: "4", name: "system" },
];

// Mock audit log data
const generateMockLogs = () => {
  const actions = [
    { category: "user", action: "user.create", target: { type: "user", id: "usr_123", name: "john@example.com" }, summary: "Created new user account" },
    { category: "user", action: "user.ban", target: { type: "user", id: "usr_456", name: "spammer@example.com" }, summary: "Banned user for TOS violation" },
    { category: "user", action: "user.verify", target: { type: "user", id: "usr_789", name: "educator@example.com" }, summary: "Verified educator account" },
    { category: "course", action: "course.approve", target: { type: "course", id: "crs_123", name: "Intro to Tajweed" }, summary: "Approved course for publishing" },
    { category: "course", action: "course.reject", target: { type: "course", id: "crs_456", name: "Draft Course" }, summary: "Rejected course - content issues" },
    { category: "course", action: "course.feature", target: { type: "course", id: "crs_789", name: "Arabic 101" }, summary: "Featured course on homepage" },
    { category: "payment", action: "payment.refund", target: { type: "transaction", id: "txn_123", name: "TXN-12345" }, summary: "Processed refund for $29.99" },
    { category: "payment", action: "payment.payout", target: { type: "payout", id: "pay_456", name: "PAY-67890" }, summary: "Released payout to educator" },
    { category: "moderation", action: "moderation.review", target: { type: "review", id: "rev_123", name: "Review #123" }, summary: "Removed inappropriate review" },
    { category: "moderation", action: "moderation.flag", target: { type: "content", id: "cnt_456", name: "Forum Post" }, summary: "Flagged content for review" },
    { category: "system", action: "system.config", target: { type: "setting", id: "set_123", name: "Platform Fee" }, summary: "Updated platform fee to 4.5%" },
    { category: "system", action: "system.backup", target: { type: "backup", id: "bkp_789", name: "Daily Backup" }, summary: "Initiated manual backup" },
  ];

  const logs = [];
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const actionData = actions[Math.floor(Math.random() * actions.length)];
    const actor = ADMIN_ACTORS[Math.floor(Math.random() * ADMIN_ACTORS.length)];
    const date = new Date(now.getTime() - i * 3600000 * Math.random() * 24);

    logs.push({
      id: `log_${i}`,
      timestamp: date.toISOString(),
      actor: actor.name,
      actorId: actor.id,
      ...actionData,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const mockLogs = generateMockLogs();

// Format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return format(date, "MMM d, yyyy HH:mm:ss");
};

// Get target link
const getTargetLink = (target) => {
  const links = {
    user: `/admin/users/${target.id}`,
    course: `/dashboard/courses/${target.id}`,
    transaction: `/admin/transactions/${target.id}`,
    payout: `/admin/payouts/${target.id}`,
    review: `/admin/reviews/${target.id}`,
    content: `/admin/content/${target.id}`,
    setting: `/admin/settings`,
    backup: `/admin/backups/${target.id}`,
  };
  return links[target.type] || "#";
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  // Simulate server-side pagination
  const fetchLogs = useCallback(async (page, filters) => {
    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter logs
    let filteredLogs = [...mockLogs];

    if (filters.actor !== "all") {
      filteredLogs = filteredLogs.filter((log) => log.actor === filters.actor);
    }

    if (filters.category !== "all") {
      filteredLogs = filteredLogs.filter((log) => log.category === filters.category);
    }

    if (filters.dateRange?.from) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= filters.dateRange.from
      );
    }

    if (filters.dateRange?.to) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) <= filters.dateRange.to
      );
    }

    // Paginate
    const total = Math.ceil(filteredLogs.length / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedLogs = filteredLogs.slice(start, start + pageSize);

    setLogs(paginatedLogs);
    setTotalPages(total);
    setLoading(false);
  }, []);

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchLogs(currentPage, {
      actor: actorFilter,
      category: categoryFilter,
      dateRange,
    });
  }, [fetchLogs, currentPage, actorFilter, categoryFilter, dateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actorFilter, categoryFilter, dateRange]);

  const handleRefresh = () => {
    fetchLogs(currentPage, {
      actor: actorFilter,
      category: categoryFilter,
      dateRange,
    });
  };

  return (
    <PageShell>
      <PageHeader
        icon={FileText}
        title="Audit Logs"
        subtitle="Track all administrative actions across the platform"
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Actor Filter */}
            <div className="space-y-2">
              <span className={cn(poppins_500.className, "text-sm block")}>Admin Actor</span>
              <Select value={actorFilter} onValueChange={setActorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actors</SelectItem>
                  {ADMIN_ACTORS.map((actor) => (
                    <SelectItem key={actor.id} value={actor.name}>
                      {actor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <span className={cn(poppins_500.className, "text-sm block")}>Action Category</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ACTION_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={cn("h-4 w-4", cat.color)} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <span className={cn(poppins_500.className, "text-sm block")}>Date Range</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({ from: null, to: null })}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Events</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[180px]">Admin Actor</TableHead>
                  <TableHead className="w-[150px]">Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const category = ACTION_CATEGORIES[log.category];
                    const CategoryIcon = category?.icon || FileText;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.actor}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={cn("h-4 w-4", category?.color)} />
                            <Badge variant="outline" className="text-xs">
                              {log.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={getTargetLink(log.target)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            {log.target.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.summary}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.ip}
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
        </CardContent>
      </Card>
    </PageShell>
  );
}
