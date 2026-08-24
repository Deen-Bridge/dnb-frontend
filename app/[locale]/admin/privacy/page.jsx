"use client";

import { useState, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileDown,
  User,
  RefreshCw,
  Info,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

// Request status configuration
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

// Data retention policy table
const DATA_POLICY = [
  {
    category: "Profile Information",
    data: "Name, email, profile photo",
    onExport: "Included in export",
    onDelete: "Permanently deleted",
  },
  {
    category: "Learning Progress",
    data: "Course completions, quiz scores, certificates",
    onExport: "Included in export",
    onDelete: "Anonymized (retained for analytics)",
  },
  {
    category: "Purchase History",
    data: "Transaction records, receipts",
    onExport: "Included in export",
    onDelete: "Anonymized (required for financial records)",
  },
  {
    category: "Content Created",
    data: "Reviews, comments, forum posts",
    onExport: "Included in export",
    onDelete: "Anonymized (author shown as 'Deleted User')",
  },
  {
    category: "Messages",
    data: "Direct messages, chat history",
    onExport: "Included in export",
    onDelete: "Permanently deleted",
  },
  {
    category: "Account Settings",
    data: "Preferences, notification settings",
    onExport: "Included in export",
    onDelete: "Permanently deleted",
  },
];

// Mock export requests
const mockExportRequests = [
  {
    id: "exp_1",
    userId: "usr_123",
    userEmail: "john@example.com",
    requestedAt: "2024-01-15T10:30:00Z",
    status: "completed",
    completedAt: "2024-01-15T10:45:00Z",
    downloadUrl: "/api/exports/exp_1/download",
    expiresAt: "2024-01-22T10:45:00Z",
  },
  {
    id: "exp_2",
    userId: "usr_456",
    userEmail: "jane@example.com",
    requestedAt: "2024-01-15T14:00:00Z",
    status: "processing",
    completedAt: null,
    downloadUrl: null,
    expiresAt: null,
  },
  {
    id: "exp_3",
    userId: "usr_789",
    userEmail: "bob@example.com",
    requestedAt: "2024-01-14T09:00:00Z",
    status: "pending",
    completedAt: null,
    downloadUrl: null,
    expiresAt: null,
  },
];

// Mock deletion requests
const mockDeletionRequests = [
  {
    id: "del_1",
    userId: "usr_321",
    userEmail: "alice@example.com",
    requestedAt: "2024-01-15T11:00:00Z",
    status: "pending",
    reason: "No longer using the platform",
    scheduledFor: "2024-01-22T11:00:00Z",
  },
  {
    id: "del_2",
    userId: "usr_654",
    userEmail: "charlie@example.com",
    requestedAt: "2024-01-14T16:00:00Z",
    status: "completed",
    reason: "Privacy concerns",
    completedAt: "2024-01-14T16:30:00Z",
  },
];

export default function DataPrivacyPage() {
  const [exportRequests, setExportRequests] = useState(mockExportRequests);
  const [deletionRequests, setDeletionRequests] = useState(mockDeletionRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [processing, setProcessing] = useState({});

  // Trigger export job
  const handleTriggerExport = useCallback(async (requestId) => {
    setProcessing((prev) => ({ ...prev, [requestId]: true }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setExportRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: "processing" }
          : req
      )
    );

    setProcessing((prev) => ({ ...prev, [requestId]: false }));
  }, []);

  // Process deletion request
  const handleProcessDeletion = useCallback(async () => {
    if (!selectedRequest) return;

    setProcessing((prev) => ({ ...prev, [selectedRequest.id]: true }));
    setShowDeleteConfirm(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setDeletionRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, status: "processing" }
          : req
      )
    );

    setProcessing((prev) => ({ ...prev, [selectedRequest.id]: false }));
    setSelectedRequest(null);
  }, [selectedRequest]);

  // Stats
  const exportStats = {
    pending: exportRequests.filter((r) => r.status === "pending").length,
    processing: exportRequests.filter((r) => r.status === "processing").length,
    completed: exportRequests.filter((r) => r.status === "completed").length,
  };

  const deletionStats = {
    pending: deletionRequests.filter((r) => r.status === "pending").length,
    processing: deletionRequests.filter((r) => r.status === "processing").length,
    completed: deletionRequests.filter((r) => r.status === "completed").length,
  };

  return (
    <PageShell>
      <PageHeader
        icon={Shield}
        title="Data Privacy"
        subtitle="Manage GDPR data export and erasure requests"
        actions={
          <Button variant="outline" onClick={() => setShowPolicyModal(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View Data Policy
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {exportRequests.length}
                </p>
                <p className="text-xs text-muted-foreground">Export Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {deletionRequests.length}
                </p>
                <p className="text-xs text-muted-foreground">Deletion Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {exportStats.pending + deletionStats.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {exportStats.completed + deletionStats.completed}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Tabs */}
      <Tabs defaultValue="exports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exports" className="gap-2">
            <Download className="h-4 w-4" />
            Export Requests
            {exportStats.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {exportStats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deletions" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Deletion Requests
            {deletionStats.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {deletionStats.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Export Requests Tab */}
        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Export Requests</CardTitle>
              <CardDescription>
                Users requesting a copy of their personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No export requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      exportRequests.map((request) => {
                        const status = STATUS_CONFIG[request.status];
                        const StatusIcon = status.icon;
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{request.userEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(request.requestedAt), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn("gap-1", status.color)}
                              >
                                <StatusIcon className={cn(
                                  "h-3 w-3",
                                  request.status === "processing" && "animate-spin"
                                )} />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {request.completedAt
                                ? format(new Date(request.completedAt), "MMM d, HH:mm")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {request.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTriggerExport(request.id)}
                                    disabled={processing[request.id]}
                                  >
                                    {processing[request.id] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Process
                                      </>
                                    )}
                                  </Button>
                                )}
                                {request.status === "completed" && request.downloadUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={request.downloadUrl}>
                                      <FileDown className="h-4 w-4 mr-1" />
                                      Download
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deletion Requests Tab */}
        <TabsContent value="deletions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Deletion Requests</CardTitle>
              <CardDescription>
                Users requesting permanent account removal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletionRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No deletion requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      deletionRequests.map((request) => {
                        const status = STATUS_CONFIG[request.status];
                        const StatusIcon = status.icon;
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{request.userEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(request.requestedAt), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn("gap-1", status.color)}
                              >
                                <StatusIcon className={cn(
                                  "h-3 w-3",
                                  request.status === "processing" && "animate-spin"
                                )} />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowDeleteConfirm(true);
                                  }}
                                  disabled={processing[request.id]}
                                >
                                  {processing[request.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Process
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription>
              This action will permanently process the deletion request for{" "}
              <strong>{selectedRequest?.userEmail}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className={cn(poppins_500.className, "text-sm text-red-800 mb-2")}>
                The following actions will be taken:
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Profile information will be <strong>permanently deleted</strong></li>
                <li>Messages will be <strong>permanently deleted</strong></li>
                <li>Learning progress will be <strong>anonymized</strong></li>
                <li>Purchase history will be <strong>anonymized</strong></li>
                <li>Created content will show as "Deleted User"</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <p className={cn(poppins_500.className, "text-sm mb-2")}>
                Data Retention Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Permanently Deleted:</div>
                <div>Profile, Messages, Settings</div>
                <div className="text-muted-foreground">Anonymized:</div>
                <div>Progress, Purchases, Content</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleProcessDeletion}>
              <Trash2 className="h-4 w-4 mr-2" />
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Policy Modal */}
      <Dialog open={showPolicyModal} onOpenChange={setShowPolicyModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Retention Policy</DialogTitle>
            <DialogDescription>
              How user data is handled during export and deletion requests
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Category</TableHead>
                  <TableHead>Data Included</TableHead>
                  <TableHead>On Export</TableHead>
                  <TableHead>On Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DATA_POLICY.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className={cn(poppins_500.className, "text-sm")}>
                      {row.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.data}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs text-blue-600">
                        {row.onExport}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          row.onDelete.includes("Permanently")
                            ? "text-red-600"
                            : "text-amber-600"
                        )}
                      >
                        {row.onDelete}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Per GDPR requirements, users have the right to export their data and request
              account deletion. Some data must be retained in anonymized form for legal
              and financial compliance.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPolicyModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
