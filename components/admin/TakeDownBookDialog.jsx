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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

const TAKE_DOWN_REASONS = [
  { value: "content-violation", label: "Content Policy Violation" },
  { value: "dmca", label: "DMCA / Copyright Notice" },
  { value: "quality-issues", label: "Quality Issues" },
  { value: "other", label: "Other" },
];

export default function TakeDownBookDialog({
  open,
  onOpenChange,
  book,
  onTakenDown,
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = reason !== "" && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      // Mock handler — replace with real action when API is ready
      await new Promise((resolve) => setTimeout(resolve, 600));
      onTakenDown?.(book._id, { reason, note });
      onOpenChange(false);
      setReason("");
      setNote("");
    } catch (err) {
      setError(err?.message || "Failed to take down book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setReason("");
    setNote("");
    setError(null);
    onOpenChange(false);
  };

  const reasonLabel =
    TAKE_DOWN_REASONS.find((r) => r.value === reason)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2",
              poppins_500.className
            )}
          >
            <AlertTriangle
              className="h-5 w-5 text-destructive"
              aria-hidden="true"
            />
            Take Down Book
          </DialogTitle>
          <DialogDescription className={poppins_400.className}>
            This will hide <strong>{book?.title ?? "this book"}</strong> from
            the catalog and reading views. Existing purchasers will retain
            library access where licensing allows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label
              htmlFor="takedown-reason"
              className={poppins_500.className}
            >
              Reason <span aria-hidden="true" className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={submitting}
            >
              <SelectTrigger id="takedown-reason" className="w-full">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {TAKE_DOWN_REASONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="takedown-note"
              className={poppins_500.className}
            >
              Additional note (optional)
            </Label>
            <Textarea
              id="takedown-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional details for the audit log…"
              disabled={submitting}
              rows={3}
            />
          </div>

          {error && (
            <p
              role="alert"
              className={cn(
                "text-sm text-destructive",
                poppins_400.className
              )}
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label={
              reasonLabel
                ? `Confirm take-down: ${reasonLabel}`
                : "Confirm take-down (select a reason first)"
            }
          >
            {submitting ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Taking down…
              </>
            ) : (
              "Take Down Book"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
