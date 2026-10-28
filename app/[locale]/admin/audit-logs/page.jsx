"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import { format } from "date-fns";

// Action categories
const ACTION_CATEGORIES = {
  user: { label: "User", icon: User, color: "text-blue-500" },
  course: { label: "Course", icon: GraduationCap, color: "text-purple-500" },
  payment: { label: "Payment", icon: CreditCard, color: "text-green-500" },
  moderation: { label: "Moderation", icon: Shield, color: "text-amber-500" },
  system: { label: "System", icon: Settings, color: "text-gray-500" },
};

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

function formatDateRange(range) {
  if (!range?.from) return "Select date range";
  if (range.to) {
    return `${format(range.from, "LLL dd")} - ${format(range.to, "LLL dd")}`;
  }
  return format(range.from, "LLL dd, y");
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actorFilter, setActorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  // Fetch audit logs from the real endpoint
  const fetchLogs = useCallback(async (page, filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (filters.actor !== "all") params.set("actor", filters.actor);
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.dateRange?.from) {
        params.set("from", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.set("to", filters.dateRange.to.toISOString());
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load audit logs (${res.status})`);
      }

      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
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
                    {formatDateRange(dateRange)}
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
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-destructive">
                      {error}
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
                        <TableCell className="font-mono texe-xs">
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
                        <TableCell className="font-mono texe-xs text-muted-foreground">
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
              <div className="flex items-center gap-2">
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
