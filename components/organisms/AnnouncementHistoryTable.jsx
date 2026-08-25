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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Send,
  Clock,
  FileText,
  Ban,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

const STATE_CONFIG = {
  draft: {
    label: "Draft",
    icon: FileText,
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  sent: {
    label: "Sent",
    icon: Send,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
};

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "students", label: "Students" },
  { value: "educators", label: "Educators" },
  { value: "admins", label: "Admins" },
];

const generateMockAnnouncements = () => {
  const items = [
    {
      id: "ann_1",
      title: "Platform Maintenance - August 30",
      body: "Scheduled maintenance window from 2:00 AM to 6:00 AM UTC.",
      audience: "all",
      state: "sent",
      sentCount: 12450,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-20T10:00:00Z",
      scheduledFor: null,
      sentAt: "2026-08-20T10:00:00Z",
    },
    {
      id: "ann_2",
      title: "New Course Launch: Advanced Tajweed",
      body: "We are excited to announce a new advanced Tajweed course.",
      audience: "students",
      state: "sent",
      sentCount: 8320,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-18T14:30:00Z",
      scheduledFor: null,
      sentAt: "2026-08-18T14:30:00Z",
    },
    {
      id: "ann_3",
      title: "Educator Payout Update",
      body: "Payout schedules have been updated for the upcoming quarter.",
      audience: "educators",
      state: "sent",
      sentCount: 342,
      createdBy: "finance@deenbridge.com",
      createdAt: "2026-08-15T09:00:00Z",
      scheduledFor: null,
      sentAt: "2026-08-15T09:00:00Z",
    },
    {
      id: "ann_4",
      title: "Security Policy Update",
      body: "Please review the updated security and privacy policies.",
      audience: "all",
      state: "sent",
      sentCount: 12100,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-10T11:00:00Z",
      scheduledFor: null,
      sentAt: "2026-08-10T11:00:00Z",
    },
    {
      id: "ann_5",
      title: "Back to School Promotion",
      body: "Special discount on all courses for the new academic year.",
      audience: "students",
      state: "scheduled",
      sentCount: null,
      createdBy: "marketing@deenbridge.com",
      createdAt: "2026-08-22T16:00:00Z",
      scheduledFor: "2026-09-01T08:00:00Z",
      sentAt: null,
    },
    {
      id: "ann_6",
      title: "Upcoming Webinar: Quran Memorization Tips",
      body: "Join us for a live webinar on effective Quran memorization strategies.",
      audience: "students",
      state: "scheduled",
      sentCount: null,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-23T12:00:00Z",
      scheduledFor: "2026-09-05T18:00:00Z",
      sentAt: null,
    },
    {
      id: "ann_7",
      title: "Educator Onboarding Webinar",
      body: "New webinar series for educators joining the platform.",
      audience: "educators",
      state: "scheduled",
      sentCount: null,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-24T09:00:00Z",
      scheduledFor: "2026-09-10T14:00:00Z",
      sentAt: null,
    },
    {
      id: "ann_8",
      title: "Holiday Closure Notice",
      body: "The platform will observe reduced support during the holiday.",
      audience: "all",
      state: "cancelled",
      sentCount: null,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-12T08:00:00Z",
      scheduledFor: "2026-08-15T00:00:00Z",
      sentAt: null,
      cancelledAt: "2026-08-13T10:00:00Z",
    },
    {
      id: "ann_9",
      title: "Course Review Reminder",
      body: "Please review your recently completed courses.",
      audience: "students",
      state: "draft",
      sentCount: null,
      createdBy: "marketing@deenbridge.com",
      createdAt: "2026-08-25T08:30:00Z",
      scheduledFor: null,
      sentAt: null,
    },
    {
      id: "ann_10",
      title: "New Admin Role Permissions",
      body: "Updated permissions for admin roles have been released.",
      audience: "admins",
      state: "draft",
      sentCount: null,
      createdBy: "admin@deenbridge.com",
      createdAt: "2026-08-25T10:00:00Z",
      scheduledFor: null,
      sentAt: null,
    },
  ];

  return items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

export default function AnnouncementHistoryTable() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelDialog, setCancelDialog] = useState({ open: false, announcement: null });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editScheduledFor, setEditScheduledFor] = useState("");
  const pageSize = 10;

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    let items = generateMockAnnouncements();

    if (stateFilter !== "all") {
      items = items.filter((a) => a.state === stateFilter);
    }
    if (audienceFilter !== "all") {
      items = items.filter((a) => a.audience === audienceFilter);
    }

    const total = Math.ceil(items.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    setAnnouncements(paginated);
    setTotalPages(total);
    setLoading(false);
  }, [currentPage, stateFilter, audienceFilter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stateFilter, audienceFilter]);

  const handleCancel = (announcement) => {
    setCancelDialog({ open: true, announcement });
  };

  const confirmCancel = () => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === cancelDialog.announcement.id
          ? { ...a, state: "cancelled", cancelledAt: new Date().toISOString() }
          : a
      )
    );
    setCancelDialog({ open: false, announcement: null });
  };

  const handleDuplicateAsDraft = (announcement) => {
    const newAnn = {
      ...announcement,
      id: `ann_${Date.now()}`,
      title: `${announcement.title} (Copy)`,
      state: "draft",
      sentCount: null,
      createdAt: new Date().toISOString(),
      scheduledFor: null,
      sentAt: null,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleStartEdit = (announcement) => {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditScheduledFor(
      announcement.scheduledFor
        ? format(new Date(announcement.scheduledFor), "yyyy-MM-dd'T'HH:mm")
        : ""
    );
  };

  const handleSaveEdit = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              title: editTitle,
              scheduledFor: editScheduledFor
                ? new Date(editScheduledFor).toISOString()
                : a.scheduledFor,
            }
          : a
      )
    );
    setEditingId(null);
    setEditTitle("");
    setEditScheduledFor("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditScheduledFor("");
  };

  const getAudienceLabel = (audience) =>
    AUDIENCE_OPTIONS.find((a) => a.value === audience)?.label || audience;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    return format(new Date(timestamp), "MMM d, yyyy HH:mm");
  };

  return (
    <PageShell>
      <PageHeader
        icon={Bell}
        title="Announcement History"
        subtitle="View, edit, and manage all past and scheduled announcements"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnnouncements}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className={cn(poppins_500.className, "text-sm")}>
                State
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "draft", "scheduled", "sent", "cancelled"].map(
                  (state) => (
                    <Button
                      key={state}
                      variant={stateFilter === state ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStateFilter(state)}
                      className="capitalize"
                    >
                      {state === "all" ? "All States" : state}
                    </Button>
                  )
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className={cn(poppins_500.className, "text-sm")}>
                Audience
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "students", "educators", "admins"].map(
                  (audience) => (
                    <Button
                      key={audience}
                      variant={
                        audienceFilter === audience ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAudienceFilter(audience)}
                      className="capitalize"
                    >
                      {audience === "all"
                        ? "All Audiences"
                        : getAudienceLabel(audience)}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Announcements</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="w-[130px]">Audience</TableHead>
                  <TableHead className="w-[120px]">State</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Sent Count
                  </TableHead>
                  <TableHead className="w-[150px]">Created By</TableHead>
                  <TableHead className="w-[160px]">Created At</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : announcements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No announcements found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((ann) => {
                    const stateCfg = STATE_CONFIG[ann.state];
                    const StateIcon = stateCfg.icon;
                    const isEditing = editingId === ann.id;
                    const isEditable =
                      ann.state === "draft" || ann.state === "scheduled";
                    const isReadOnly = ann.state === "sent";

                    return (
                      <TableRow key={ann.id}>
                        <TableCell>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={cn(
                                poppins_400.className,
                                "w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              )}
                            />
                          ) : (
                            <span className={cn(poppins_500.className, "text-sm")}>
                              {ann.title}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {getAudienceLabel(ann.audience)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs gap-1", stateCfg.badgeClass)}
                          >
                            <StateIcon className="h-3 w-3" />
                            {stateCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {ann.sentCount !== null ? (
                            <span
                              className={cn(
                                poppins_500.className,
                                "text-sm tabular-nums"
                              )}
                            >
                              {ann.sentCount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {ann.createdBy}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(ann.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleSaveEdit(ann.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isEditable && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleStartEdit(ann)}
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleCancel(ann)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Cancel Announcement
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDuplicateAsDraft(ann)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate as Draft
                                </DropdownMenuItem>
                                {isReadOnly && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Read Only
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
                  disabled={currentPage === 1 || loading}
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => {
          if (!open) setCancelDialog({ open: false, announcement: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel &quot;
              {cancelDialog.announcement?.title}&quot;? This action cannot be
              undone. The announcement will not be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Announcement</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
