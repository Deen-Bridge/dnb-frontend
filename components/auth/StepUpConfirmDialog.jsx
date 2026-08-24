"use client";
/**
 * StepUpConfirmDialog — reusable step-up confirmation for sensitive actions
 * (pattern from issue #311).
 * -------------------------------------------------------------------------
 * A destructive mutation must never fire off a single click. This dialog adds
 * an explicit confirmation *step*: the acting admin must type a phrase (by
 * default the affected member's email) before the confirm button unlocks, then
 * the async `onConfirm` runs with in-flight state. Cancel/escape/close are all
 * safe — the mutation only fires via the enabled button.
 *
 * Usage:
 *   <StepUpConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Demote admin"
 *     description={`${member.name} will lose super-admin permissions.`}
 *     confirmPhrase={member.email}
 *     confirmLabel="Demote"
 *     onConfirm={() => demoteMember(member.id, { confirmation: member.email })}
 *   />
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

function StepUpConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmPhrase,
  confirmLabel = "Confirm",
  onConfirm,
}) {
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the typed confirmation every time the dialog opens/closes so a
  // previously satisfied challenge can never carry over to another action.
  useEffect(() => {
    if (!open) {
      setConfirmation("");
      setIsSubmitting(false);
    }
  }, [open]);

  const isConfirmed =
    typeof confirmation === "string" &&
    confirmation.trim().length > 0 &&
    confirmation.trim().toLowerCase() === String(confirmPhrase || "").trim().toLowerCase();

  const handleConfirm = async () => {
    if (!isConfirmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm?.({ confirmation: confirmation.trim() });
      onOpenChange?.(false);
    } catch (err) {
      console.error("Step-up confirmed action failed:", err);
      toast.error(err?.message || "Action failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange?.(next)}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}>
            <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-2">
          <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
            This action is sensitive and cannot be undone. Type{" "}
            <span className={cn(poppins_500.className, "font-mono text-ink")}>"{confirmPhrase}"</span>{" "}
            to confirm.
          </p>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={confirmPhrase}
            autoComplete="off"
            disabled={isSubmitting}
            aria-label={`Type ${confirmPhrase} to confirm`}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={isSubmitting}
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-full"
            disabled={!isConfirmed || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { StepUpConfirmDialog };
export default StepUpConfirmDialog;
