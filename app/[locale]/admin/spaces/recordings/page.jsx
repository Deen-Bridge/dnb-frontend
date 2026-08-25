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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Video,
  Trash2,
  Search,
  HardDrive,
  Clock,
  AlertTriangle,
  Loader2,
  Settings,
  Info,
  Download,
  Film,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

const MOCK_SPACES = [
  {
    id: "space_1",
    name: "Quran Study Circle",
    recordings: [
      {
        id: "rec_1",
        fileName: "session-2024-01-15.mp4",
        size: 245000000,
        createdAt: "2024-01-15T10:00:00Z",
        duration: 3600,
        status: "completed",
      },
      {
        id: "rec_2",
        fileName: "session-2024-01-22.mp4",
        size: 189000000,
        createdAt: "2024-01-22T14:30:00Z",
        duration: 2700,
        status: "completed",
      },
    ],
  },
  {
    id: "space_2",
    name: "Islamic History Discussion",
    recordings: [
      {
        id: "rec_3",
        fileName: "lecture-part1.mp4",
        size: 512000000,
        createdAt: "2024-01-20T09:00:00Z",
        duration: 5400,
        status: "completed",
      },
    ],
  },
  {
    id: "space_3",
    name: "Youth Halaqah",
    recordings: [],
  },
];

const RETENTION_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never auto-delete" },
];

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function RecordingRetentionPage() {
  const [spaces, setSpaces] = useState(MOCK_SPACES);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [retentionSettings, setRetentionSettings] = useState({
    autoDeleteEnabled: false,
    retentionPeriod: "30",
    warningDays: 7,
  });
  const [deleting, setDeleting] = useState({});

  const filteredSpaces = useMemo(() => {
    if (!searchQuery.trim()) return spaces;
    const query = searchQuery.toLowerCase();
    return spaces.filter((space) =>
      space.name.toLowerCase().includes(query)
    );
  }, [spaces, searchQuery]);

  const totalRecordings = useMemo(
    () => spaces.reduce((acc, space) => acc + space.recordings.length, 0),
    [spaces]
  );

  const totalSize = useMemo(
    () =>
      spaces.reduce(
        (acc, space) =>
          acc + space.recordings.reduce((rAcc, rec) => rAcc + rec.size, 0),
        0
      ),
    [spaces]
  );

  const handleDeleteRecording = useCallback(async () => {
    if (!recordingToDelete || !selectedSpace) return;

    setDeleting((prev) => ({ ...prev, [recordingToDelete.id]: true }));
    setShowDeleteDialog(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSpaces((prev) =>
      prev.map((space) =>
        space.id === selectedSpace.id
          ? {
              ...space,
              recordings: space.recordings.filter(
                (rec) => rec.id !== recordingToDelete.id
              ),
            }
          : space
      )
    );

    setDeleting((prev) => ({ ...prev, [recordingToDelete.id]: false }));
    setRecordingToDelete(null);
  }, [recordingToDelete, selectedSpace]);

  return (
    <PageShell>
      <PageHeader
        icon={Video}
        title="Recording Retention"
        subtitle="Manage Jitsi recording retention for space sessions"
        actions={
          <Button variant="outline" onClick={() => setShowPolicyDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Retention Policy
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {totalRecordings}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Recordings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-amber-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {formatFileSize(totalSize)}
                </p>
                <p className="text-xs text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-green-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {spaces.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Spaces
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className={cn(poppins_600.className, "text-2xl")}>
                  {retentionSettings.autoDeleteEnabled
                    ? `${retentionSettings.retentionPeriod}d`
                    : "Off"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-Delete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search spaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="recordings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recordings" className="gap-2">
            <Film className="h-4 w-4" />
            Recordings
          </TabsTrigger>
          <TabsTrigger value="policy" className="gap-2">
            <Settings className="h-4 w-4" />
            Policy Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recordings">
          {filteredSpaces.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No spaces found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No spaces match your search"
                    : "No spaces have been created yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSpaces.map((space) => (
                <Card key={space.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{space.name}</CardTitle>
                        <CardDescription>
                          {space.recordings.length === 0
                            ? "No recordings"
                            : `${space.recordings.length} recording${space.recordings.length !== 1 ? "s" : ""}`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedSpace(
                            selectedSpace?.id === space.id ? null : space
                          )
                        }
                      >
                        {selectedSpace?.id === space.id
                          ? "Close"
                          : "View Recordings"}
                      </Button>
                    </div>
                  </CardHeader>
                  {selectedSpace?.id === space.id && (
                    <CardContent>
                      {space.recordings.length === 0 ? (
                        <div className="py-8 text-center border rounded-lg">
                          <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="font-medium">No recordings yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Recordings will appear here when sessions are recorded
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Recording</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {space.recordings.map((recording) => (
                                <TableRow key={recording.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Film className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">
                                        {recording.fileName}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {formatFileSize(recording.size)}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {formatDuration(recording.duration)}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {format(
                                      new Date(recording.createdAt),
                                      "MMM d, yyyy"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-green-600"
                                    >
                                      {recording.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                          setRecordingToDelete(recording);
                                          setShowDeleteDialog(true);
                                        }}
                                        disabled={deleting[recording.id]}
                                      >
                                        {deleting[recording.id] ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Policy</CardTitle>
              <CardDescription>
                Configure automatic deletion rules for space recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className={cn(poppins_500.className, "text-sm")}>
                    Auto-Delete Recordings
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically delete recordings after the retention period
                  </p>
                </div>
                <Switch
                  checked={retentionSettings.autoDeleteEnabled}
                  onCheckedChange={(checked) =>
                    setRetentionSettings((prev) => ({
                      ...prev,
                      autoDeleteEnabled: checked,
                    }))
                  }
                />
              </div>

              {retentionSettings.autoDeleteEnabled && (
                <>
                  <div className="space-y-2">
                    <p className={cn(poppins_500.className, "text-sm")}>
                      Retention Period
                    </p>
                    <Select
                      value={retentionSettings.retentionPeriod}
                      onValueChange={(value) =>
                        setRetentionSettings((prev) => ({
                          ...prev,
                          retentionPeriod: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {RETENTION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className={cn(poppins_500.className, "text-sm")}>
                      Warning Period (days before deletion)
                    </p>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={retentionSettings.warningDays}
                      onChange={(e) =>
                        setRetentionSettings((prev) => ({
                          ...prev,
                          warningDays: parseInt(e.target.value) || 7,
                        }))
                      }
                      className="max-w-xs"
                    />
                  </div>
                </>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className={cn(poppins_500.className, "mb-1")}>
                      About Retention Policies
                    </p>
                    <p className="text-blue-700">
                      Recordings are stored securely and can be downloaded by
                      admins at any time. Auto-delete helps manage storage
                      costs while ensuring important recordings are preserved
                      when needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Recording
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this recording? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {recordingToDelete && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {recordingToDelete.fileName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Size:</div>
                <div>{formatFileSize(recordingToDelete.size)}</div>
                <div>Duration:</div>
                <div>{formatDuration(recordingToDelete.duration)}</div>
                <div>Created:</div>
                <div>
                  {format(new Date(recordingToDelete.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecording}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Retention Policy Summary</DialogTitle>
            <DialogDescription>
              Current recording retention configuration for all spaces
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setting</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Auto-Delete Enabled
                    </TableCell>
                    <TableCell>
                      <Badge variant={retentionSettings.autoDeleteEnabled ? "default" : "secondary"}>
                        {retentionSettings.autoDeleteEnabled ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Retention Period
                    </TableCell>
                    <TableCell>
                      {retentionSettings.autoDeleteEnabled
                        ? RETENTION_OPTIONS.find(
                            (o) => o.value === retentionSettings.retentionPeriod
                          )?.label || "Not set"
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Warning Period
                    </TableCell>
                    <TableCell>
                      {retentionSettings.autoDeleteEnabled
                        ? `${retentionSettings.warningDays} days before deletion`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Total Storage
                    </TableCell>
                    <TableCell>{formatFileSize(totalSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Total Recordings
                    </TableCell>
                    <TableCell>{totalRecordings}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Retention policies apply globally to all spaces. Admins can
                override per-space settings when this feature is available.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPolicyDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
