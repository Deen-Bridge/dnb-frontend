"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Film,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export function CreatorReelsControlDialog({
  open,
  onOpenChange,
  creator,
  reelsCount = 0,
  isCurrentlyPaused = false,
  onConfirm,
}) {
  const [reason, setReason] = useState("policy_violation");
  const [loading, setLoading] = useState(false);

  if (!creator) return null;

  const handleAction = async () => {
    setLoading(true);
    try {
      await onConfirm({
        creatorId: creator._id || creator.id,
        action: isCurrentlyPaused ? "resume" : "pause",
        reason: isCurrentlyPaused ? null : reason,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-base font-semibold">
            {isCurrentlyPaused ? (
              <PlayCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <PauseCircle className="h-5 w-5 text-amber-500" />
            )}
            <DialogTitle>
              {isCurrentlyPaused
                ? "Resume Creator's Reels"
                : "Pause All Reels by Creator"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isCurrentlyPaused
              ? `Restore public visibility and publishing permissions for all reels created by ${creator.name}.`
              : `Bulk-hide all live reels and prevent new uploads for ${creator.name} pending moderation review.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Creator & Impact Summary */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Creator:</span>
              <span className="font-medium text-foreground">{creator.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Affected Reels:</span>
              <Badge variant="secondary" className="gap-1 font-mono">
                <Film className="h-3.5 w-3.5" />
                {reelsCount} Reel{reelsCount !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Reel Status:</span>
              <Badge
                variant="outline"
                className={
                  isCurrentlyPaused
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }
              >
                {isCurrentlyPaused ? "Paused / Hidden" : "Active / Visible"}
              </Badge>
            </div>
          </div>

          {/* Cross-Link to Creator Profile */}
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>View detailed educator profile:</span>
            <Link
              href={`/admin/users/${creator._id || creator.id}`}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              User Detail Page
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Pause Reason Selector */}
          {!isCurrentlyPaused && (
            <div className="space-y-2">
              <Label htmlFor="pause-reason" className="text-sm font-medium">
                Reason for Moderation Pause
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="pause-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy_violation">
                    Repeated Community Guideline Violations
                  </SelectItem>
                  <SelectItem value="copyright">
                    Copyright & Intellectual Property Dispute
                  </SelectItem>
                  <SelectItem value="inappropriate_audio">
                    Inappropriate Audio / Content
                  </SelectItem>
                  <SelectItem value="investigation">
                    Account Under Security / Quality Audit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isCurrentlyPaused && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Pausing will immediately hide <strong>{reelsCount}</strong> reels from student feeds, search results, and the mobile discovery app.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAction}
            disabled={loading}
            variant={isCurrentlyPaused ? "default" : "destructive"}
            className="gap-2"
          >
            {isCurrentlyPaused ? (
              <>
                <PlayCircle className="h-4 w-4" />
                Resume {reelsCount} Reels
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4" />
                Pause All {reelsCount} Reels
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
