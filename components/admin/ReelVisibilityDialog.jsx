"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REJECTION_REASON_CATEGORIES } from "@/lib/actions/admin-verifications";

export function ReelVisibilityDialog({ open, onOpenChange, reel, onConfirm, loading }) {
  const isHidden = Boolean(reel?.isHidden);
  const [reasonCategory, setReasonCategory] = useState("");
  const [reasonNote, setReasonNote] = useState("");

  useEffect(() => {
    if (open) {
      setReasonCategory("");
      setReasonNote("");
    }
  }, [open, reel?.id]);

  if (!reel) return null;

  const canSubmit = isHidden || (reasonCategory && reasonNote.trim());
  const submit = async () => {
    if (!canSubmit) return;
    await onConfirm({
      hidden: !isHidden,
      ...(isHidden ? {} : { reasonCategory, reasonNote: reasonNote.trim() }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isHidden ? "Restore reel visibility" : "Hide reel from learners"}</DialogTitle>
          <DialogDescription>
            {isHidden
              ? `Restore “${reel.title}” to learner-facing feeds.`
              : `Hide “${reel.title}” everywhere learners can discover reels. The reel remains available to administrators.`}
          </DialogDescription>
        </DialogHeader>

        {!isHidden && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reel-hide-reason">Reason category</Label>
              <Select value={reasonCategory} onValueChange={setReasonCategory}>
                <SelectTrigger id="reel-hide-reason"><SelectValue placeholder="Select a reason category" /></SelectTrigger>
                <SelectContent>
                  {REJECTION_REASON_CATEGORIES.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>{reason.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reel-hide-note">Moderation note</Label>
              <Textarea
                id="reel-hide-note"
                value={reasonNote}
                onChange={(event) => setReasonNote(event.target.value)}
                placeholder="Explain why this reel is being hidden"
                required
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={isHidden ? "default" : "destructive"} onClick={submit} disabled={!canSubmit || loading}>
            {isHidden ? "Unhide reel" : "Hide reel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
