"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
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
import {
  FileText,
  Download,
  Search,
  Clock,
  Calendar,
  Filter,
  AlertTriangle,
  Shield,
  User,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

// Mock audit log data
const mockAuditLogs = [
  {
    id: "1",
    timestamp: "2024-01-15T14:32:00Z",
    action: "user.login",
    actor: "admin@deenbridge.com",
    target: "User: john@example.com",
    ip: "192.168.1.100",
    status: "success",
    details: "Successful login via email",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:28:00Z",
    action: "settings.update",
    actor: "admin@deenbridge.com",
    target: "Platform Fee",
    ip: "192.168.1.100",
    status: "success",
    details: "Changed platform fee from 5% to 4.5%",
  },
  {
    id: "3",
    timestamp: "2024-01-15T13:45:00Z",
    action: "user.ban",
    actor: "moderator@deenbridge.com",
    target: "User: spammer@example.com",
    ip: "192.168.1.101",
    status: "success",
    details: "User banned for TOS violation",
  },
  {
    id: "4",
    timestamp: "2024-01-15T12:30:00Z",
    action: "content.approve",
    actor: "moderator@deenbridge.com",
    target: "Course: Intro to Tajweed",
    ip: "192.168.1.101",
    status: "success",
    details: "Course approved after review",
  },
  {
    id: "5",
    timestamp: "2024-01-15T11:15:00Z",
    action: "payment.refund",
    actor: "admin@deenbridge.com",
    target: "Transaction: TXN-12345",
    ip: "192.168.1.100",
    status: "success",
    details: "Refund processed for $29.99",
  },
  {
    id: "6",
    timestamp: "2024-01-14T16:00:00Z",
    action: "user.login",
    actor: "unknown",
    target: "User: admin@deenbridge.com",
    ip: "10.0.0.55",
    status: "failed",
    details: "Failed login attempt - invalid password",
  },
  {
    id: "7",
    timestamp: "2024-01-14T15:30:00Z",
    action: "api.access",
    actor: "system",
    target: "API Key: pk_live_xxx",
    ip: "203.0.113.50",
    status: "success",
    details: "API key accessed from new IP",
  },
  {
    id: "8",
    timestamp: "2024-01-14T14:00:00Z",
    action: "content.reject",
    actor: "moderator@deenbridge.com",
    target: "Book: Untitled Draft",
    ip: "192.168.1.101",
    status: "success",
    details: "Content rejected - copyright concerns",
  },
];

// Retention policy configuration
const RETENTION_DAYS = 90;
const retentionEndDate = new Date();
retentionEndDate.setDate(retentionEndDate.getDate() - RETENTION_DAYS);

// Action type icons
const actionIcons = {
  "user.login": User,
  "user.ban": AlertTriangle,
  "settings.update": Settings,
  "content.approve": Shield,
  "content.reject": Shield,
  "payment.refund": CreditCard,
  "api.access": FileText,
};

// Quick date jump presets
const datePresets = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status) {
  return status === "success"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-600 border-red-200";
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logs
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction =
        actionFilter === "all" || log.action.startsWith(actionFilter);

      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;

      const logDate = new Date(log.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      const matchesDate = logDate >= cutoffDate;

      return matchesSearch && matchesAction && matchesStatus && matchesDate;
    });
  }, [searchQuery, actionFilter, statusFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "Action",
      "Actor",
      "Target",
      "IP Address",
      "Status",
      "Details",
    ];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.action,
      log.actor,
      log.target,
      log.ip,
      log.status,
      log.details,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit-log-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageShell>
      <PageHeader
        icon={FileText}
        title="Audit Log"
        subtitle="Track all administrative actions and system events"
        actions={
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Retention Policy Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className={cn(poppins_500.className, "text-sm text-amber-800")}>
              Data Retention Policy
            </p>
            <p className={cn(poppins_400.className, "text-xs text-amber-700")}>
              Audit logs are retained for {RETENTION_DAYS} days. Logs before{" "}
              {retentionEndDate.toLocaleDateString()} have been archived.
            </p>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            <Info className="mr-1 h-3 w-3" />
            {RETENTION_DAYS} Day Retention
          </Badge>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="content">Content Actions</SelectItem>
                <SelectItem value="settings">Settings Changes</SelectItem>
                <SelectItem value="payment">Payment Actions</SelectItem>
                <SelectItem value="api">API Access</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Select
              value={String(dateRange)}
              onValueChange={(v) => setDateRange(Number(v))}
            >
              <SelectTrigger>
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {datePresets.map((preset) => (
                  <SelectItem key={preset.days} value={String(preset.days || 1)}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Date Jump Shortcuts */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn(poppins_500.className, "text-sm text-muted-foreground mr-2")}>
              Quick jump:
            </span>
            {datePresets.map((preset) => (
              <Button
                key={preset.label}
                variant={dateRange === (preset.days || 1) ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(preset.days || 1)}
                className="h-7 text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Audit Events ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Showing {paginatedLogs.length} of {filteredLogs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No audit events found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => {
                    const ActionIcon =
                      actionIcons[log.action] || FileText;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ActionIcon className="h-4 w-4 text-muted-foreground" />
                            <span className={cn(poppins_500.className, "text-sm")}>
                              {log.action}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{log.actor}</TableCell>
                        <TableCell className="text-sm">{log.target}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getStatusColor(log.status))}
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {log.details}
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
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
    </PageShell>
  );
}
