"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  Clock3,
  Film,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { EmptyState } from "@/components/ui/empty-state";
import {
  cancelScheduledReelAction,
  listUpcomingScheduledReelsAction,
} from "@/lib/actions/scheduled-reels";

function creatorInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatGoLive(timestamp, timezone) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Invalid schedule";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "Invalid schedule";
  }
}

export default function ScheduledReelsQueuePage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedReel, setSelectedReel] = useState(null);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const upcomingReels = await listUpcomingScheduledReelsAction();
      setReels(upcomingReels);
    } catch (error) {
      setReels([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "The scheduled reels queue could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const closeCancelDialog = () => {
    if (cancelling) return;
    setSelectedReel(null);
    setReason("");
  };

  const confirmCancellation = async () => {
    if (!selectedReel) return;

    setCancelling(true);
    try {
      await cancelScheduledReelAction(selectedReel.id, reason);
      await loadQueue();
      setSelectedReel(null);
      setReason("");
      toast.success("Scheduled reel cancelled and creator notified.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The reel could not be cancelled."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Scheduled reels"
        description="Review and manage reels waiting to be published. Upcoming items are ordered by go-live time."
        icon={CalendarClock}
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={loadQueue}
            disabled={loading || cancelling}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Upcoming publishing queue</CardTitle>
            <CardDescription>
              {reels.length === 1
                ? "1 reel is scheduled to publish."
                : `${reels.length} reels are scheduled to publish.`}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Clock3 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Earliest first
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              className="flex min-h-64 items-center justify-center"
              role="status"
            >
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
              <span className="sr-only">Loading scheduled reels</span>
            </div>
          ) : loadError ? (
            <EmptyState
              icon={XCircle}
              title="Unable to load the queue"
              description={loadError}
              action={
                <Button type="button" variant="outline" onClick={loadQueue}>
                  Try again
                </Button>
              }
            />
          ) : reels.length === 0 ? (
            <EmptyState
              icon={Film}
              title="No scheduled reels"
              description="There are no upcoming reels waiting to be published. New scheduled items will appear here automatically."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reel</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Go-live time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reels.map((reel) => (
                    <TableRow key={reel.id}>
                      <TableCell className="min-w-72">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                            <Film
                              className="h-5 w-5 text-accent"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <p className="line-clamp-2 max-w-sm font-medium text-ink">
                              {reel.caption}
                            </p>
                            <p className="mt-1 text-xs text-ink-muted">
                              {reel.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-52 items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {creatorInitials(reel.creator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-ink">
                              {reel.creator.name}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {reel.creator.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-56">
                        <p className="font-medium text-ink">
                          {formatGoLive(reel.scheduledFor, reel.timezone)}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {reel.timezone}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Scheduled</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedReel(reel)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedReel)}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel scheduled reel?</DialogTitle>
            <DialogDescription>
              This removes the reel from the upcoming publishing queue and
              notifies its creator. The reel will not be published at its
              scheduled time.
            </DialogDescription>
          </DialogHeader>

          {selectedReel ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="line-clamp-2 font-medium text-ink">
                  {selectedReel.caption}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {selectedReel.creator.name} · {formatGoLive(
                    selectedReel.scheduledFor,
                    selectedReel.timezone
                  )} {selectedReel.timezone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-reason">
                  Reason for cancellation (optional)
                </Label>
                <Textarea
                  id="cancellation-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Add context for the creator"
                  disabled={cancelling}
                  maxLength={500}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCancelDialog}
              disabled={cancelling}
            >
              Keep scheduled
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancellation}
              disabled={cancelling}
            >
              {cancelling ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {cancelling ? "Cancelling..." : "Cancel reel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
