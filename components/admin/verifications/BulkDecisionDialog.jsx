"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_500, poppins_600 } from "@/lib/config/font.config";
import {
  REJECTION_REASON_CATEGORIES,
  MAX_BATCH_SIZE,
} from "@/lib/actions/admin-verifications";

/**
 * BulkDecisionDialog
 * ------------------
 * Pre-flight summary dialog for bulk verification decisions (#236).
 *
 * Rules:
 * - Pre-flight title: "You are about to approve {count} educators" or
 *   "You are about to reject {count} educators".
 * - Bulk approve skips notes entirely.
 * - Bulk reject requires choosing one shared reason category.
 * - Caps batch size at 25.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 * @param {"approve"|"reject"} props.action
 * @param {Array<Object>} props.selectedItems
 * @param {Function} props.onConfirm
 */
export default function BulkDecisionDialog({
  open,
  onOpenChange,
  action = "approve",
  selectedItems = [],
  onConfirm,
}) {
  const [reasonCategory, setReasonCategory] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form state whenever dialog opens or action changes
  useEffect(() => {
    if (open) {
      setReasonCategory("");
      setNotes("");
    }
  }, [open, action]);

  const itemsToProcess = selectedItems.slice(0, MAX_BATCH_SIZE);
  const count = itemsToProcess.length;
  const isApprove = action === "approve";

  const handleConfirm = () => {
    if (!isApprove && !reasonCategory) return;
    onConfirm({
      action,
      reasonCategory: isApprove ? null : reasonCategory,
      notes: isApprove ? "" : notes,
      items: itemsToProcess,
    });
  };

  const isConfirmDisabled = !isApprove && !reasonCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="bulk-decision-dialog"
        className="sm:max-w-xl max-h-[90vh] flex flex-col p-6 gap-5 bg-surface-raised border-accent/15"
      >
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                isApprove
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              )}
            >
              {isApprove ? (
                <CheckCircle className="size-6" />
              ) : (
                <XCircle className="size-6" />
              )}
            </div>

            <div>
              <DialogTitle
                data-testid="preflight-summary-title"
                className={cn(poppins_600, "text-xl text-ink leading-tight")}
              >
                {isApprove
                  ? `You are about to approve ${count} educator${count === 1 ? "" : "s"}`
                  : `You are about to reject ${count} educator${count === 1 ? "" : "s"}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted mt-0.5">
                {isApprove
                  ? "All verified applicants will gain full educator publishing permissions."
                  : "A shared rejection reason will be recorded and sent to each educator."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Pre-flight summary callout */}
          <div
            className={cn(
              "p-3.5 rounded-xl border text-xs flex items-start gap-2.5",
              isApprove
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300"
            )}
          >
            <Info className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {isApprove
                  ? "Sequential Approval Fan-Out"
                  : "Sequential Rejection Fan-Out"}
              </p>
              <p className="mt-0.5 opacity-90">
                {isApprove
                  ? "Notes are skipped for bulk approvals. Individual decisions will be executed sequentially with live progress feedback."
                  : "All rejected educators in this batch will share the selected reason category. Individual decisions will be executed sequentially."}
              </p>
            </div>
          </div>

          {/* Bulk Reject Reason Category Picker */}
          {!isApprove && (
            <div className="space-y-3 p-4 rounded-xl bg-surface border border-accent/10">
              <div className="space-y-1.5">
                <Label
                  htmlFor="bulk-rejection-reason"
                  className={cn(
                    poppins_500,
                    "text-xs text-ink font-semibold flex items-center gap-1"
                  )}
                >
                  <span>Shared Reason Category</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={reasonCategory}
                  onValueChange={setReasonCategory}
                >
                  <SelectTrigger
                    id="bulk-rejection-reason"
                    data-testid="rejection-category-select"
                    className="w-full bg-surface-raised border-accent/20 text-xs h-10"
                  >
                    <SelectValue placeholder="Select a reason category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-raised border-accent/15 z-50">
                    {REJECTION_REASON_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-xs cursor-pointer py-2"
                      >
                        <div className="font-medium text-ink">{cat.label}</div>
                        <div className="text-[11px] text-ink-muted font-normal">
                          {cat.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="bulk-rejection-notes"
                  className={cn(poppins_500, "text-xs text-ink font-semibold")}
                >
                  Additional Shared Feedback{" "}
                  <span className="text-ink-muted font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="bulk-rejection-notes"
                  data-testid="rejection-notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional guidance for the applicants..."
                  rows={2}
                  className="bg-surface-raised border-accent/20 text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* Educator list preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted font-medium px-1">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                Target Educators ({count})
              </span>
              {selectedItems.length > MAX_BATCH_SIZE && (
                <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                  Batch capped at {MAX_BATCH_SIZE} of {selectedItems.length}
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-accent/10 rounded-xl border border-accent/10 bg-surface">
              {itemsToProcess.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 px-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-7 rounded-lg border border-accent/10">
                      <AvatarFallback className="text-[10px] bg-secondary/15 text-accent font-semibold">
                        {(item.name || item.email || "E")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {item.name || "Educator Applicant"}
                      </p>
                      <p className="text-[11px] text-ink-muted truncate">
                        {item.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 border-accent/15 text-ink-muted"
                    >
                      {item.country || "Applicant"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-accent/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-accent/20 text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="confirm-bulk-decision-btn"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className={cn(
              "text-xs font-semibold h-9 px-4 text-white",
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            )}
          >
            {isApprove ? (
              <>
                <CheckCircle className="size-3.5 mr-1.5" />
                Confirm & Approve {count} Educator{count === 1 ? "" : "s"}
              </>
            ) : (
              <>
                <XCircle className="size-3.5 mr-1.5" />
                Confirm & Reject {count} Educator{count === 1 ? "" : "s"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
