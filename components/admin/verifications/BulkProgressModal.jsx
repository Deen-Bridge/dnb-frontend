"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_500, poppins_600 } from "@/lib/config/font.config";
import { executeSequentialBulkDecisions } from "@/lib/actions/admin-verifications";

/**
 * BulkProgressModal
 * -----------------
 * Modal showing sequential fan-out execution of individual decisions with real-time
 * step-by-step progress feedback and failure isolation (#236).
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {"approve"|"reject"} props.action
 * @param {Array<Object>} props.items - Selected educators
 * @param {string} [props.reasonCategory]
 * @param {string} [props.notes]
 * @param {Function} props.onComplete - Callback when batch execution completes and user finishes
 * @param {Function} props.onCancel - Cancel / abort callback
 */
export default function BulkProgressModal({
  open,
  action = "approve",
  items = [],
  reasonCategory,
  notes,
  onComplete,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemStatuses, setItemStatuses] = useState({});
  const [succeededItems, setSucceededItems] = useState([]);
  const [failedItems, setFailedItems] = useState([]);
  const listRef = useRef(null);

  const total = items.length;
  const isApprove = action === "approve";

  const runBatch = useCallback(
    async (batchItems) => {
      setIsRunning(true);
      setIsFinished(false);
      setProgressPercent(0);
      setCurrentIndex(0);

      // Initialize all items to pending status
      const initialStatuses = {};
      batchItems.forEach((it) => {
        initialStatuses[it.id] = { status: "pending", error: null };
      });
      setItemStatuses(initialStatuses);

      try {
        const result = await executeSequentialBulkDecisions({
          items: batchItems,
          action,
          reasonCategory,
          notes,
          onProgress: ({ current, total: t, percent, currentItem: curr, results }) => {
            setCurrentIndex(current);
            setCurrentItem(curr);
            setProgressPercent(percent);

            // Update item statuses mapping
            const updated = { ...initialStatuses };
            results.forEach((r) => {
              updated[r.item.id] = {
                status: r.success ? "success" : "failed",
                error: r.error || null,
              };
            });
            if (curr && updated[curr.id]?.status === "pending") {
              updated[curr.id] = { status: "in_progress", error: null };
            }
            setItemStatuses(updated);
          },
        });

        setSucceededItems(result.succeeded.map((s) => s.item));
        setFailedItems(result.failed.map((f) => ({ ...f.item, error: f.error })));
      } catch {
        // Unexpected batch error
      } finally {
        setIsRunning(false);
        setIsFinished(true);
        setProgressPercent(100);
        setCurrentItem(null);
      }
    },
    [action, reasonCategory, notes]
  );

  // Auto-start execution when modal opens with items
  useEffect(() => {
    if (open && items.length > 0 && !isRunning && !isFinished) {
      runBatch(items);
    }
  }, [open, items, isRunning, isFinished, runBatch]);

  // Handle retry of failed items
  const handleRetryFailed = () => {
    if (failedItems.length === 0) return;
    runBatch(failedItems);
  };

  const handleFinish = () => {
    if (typeof onComplete === "function") {
      onComplete({
        succeeded: succeededItems,
        failed: failedItems,
      });
    }
  };

  const successCount = succeededItems.length;
  const failCount = failedItems.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isRunning && !nextOpen) {
          handleFinish();
        }
      }}
    >
      <DialogContent
        data-testid="bulk-progress-modal"
        className="sm:max-w-lg flex flex-col p-6 gap-5 bg-surface-raised border-accent/15"
        onInteractOutside={(e) => {
          if (isRunning) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isRunning) e.preventDefault();
        }}
      >
        <DialogHeader className="gap-1.5">
          <DialogTitle
            className={cn(poppins_600, "text-lg text-ink flex items-center gap-2")}
          >
            {isRunning ? (
              <>
                <Loader2 className="size-5 animate-spin text-accent" />
                <span>
                  {isApprove ? "Approving Educators..." : "Rejecting Educators..."}
                </span>
              </>
            ) : (
              <>
                {failCount === 0 ? (
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                )}
                <span>
                  {failCount === 0
                    ? `Bulk ${isApprove ? "Approval" : "Rejection"} Complete`
                    : "Completed with Errors"}
                </span>
              </>
            )}
          </DialogTitle>

          <DialogDescription className="text-xs text-ink-muted">
            {isRunning
              ? `Processing individual API calls sequentially (${currentIndex + 1} of ${total})...`
              : `${successCount} of ${total} educator decisions processed successfully.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar and counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-ink">
              <span data-testid="bulk-progress-text">
                {isRunning
                  ? `Processing ${Math.min(currentIndex + 1, total)} of ${total} (${progressPercent}%)`
                  : `Completed 100% (${successCount} succeeded${failCount > 0 ? `, ${failCount} failed` : ""})`}
              </span>
              <span className="text-ink-muted text-[11px] font-mono">
                {progressPercent}%
              </span>
            </div>

            <Progress
              data-testid="bulk-progress-bar"
              value={progressPercent}
              className="h-2.5 bg-surface border border-accent/10"
            />
          </div>

          {/* Per-item live status list */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-accent/10 rounded-xl border border-accent/10 bg-surface"
          >
            {items.map((item, idx) => {
              const statusInfo = itemStatuses[item.id] || {
                status: "pending",
                error: null,
              };
              const isCurrent = currentItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  data-testid={`progress-row-${item.id}`}
                  className={cn(
                    "flex items-center justify-between p-2.5 px-3 text-xs transition-colors",
                    isCurrent && "bg-accent/5"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-[11px] font-mono text-ink-muted shrink-0 w-4 text-right">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {item.name || "Educator Applicant"}
                      </p>
                      <p className="text-[11px] text-ink-muted truncate">
                        {item.email}
                      </p>
                      {statusInfo.error && (
                        <p className="text-[11px] text-red-500 font-normal mt-0.5 truncate">
                          {statusInfo.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {statusInfo.status === "in_progress" && (
                      <Badge
                        variant="outline"
                        className="bg-accent/10 text-accent border-accent/30 text-[10px] py-0.5 flex items-center gap-1"
                      >
                        <Loader2 className="size-2.5 animate-spin" />
                        Processing
                      </Badge>
                    )}

                    {statusInfo.status === "success" && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0.5 flex items-center gap-1"
                      >
                        <CheckCircle className="size-2.5" />
                        {isApprove ? "Approved" : "Rejected"}
                      </Badge>
                    )}

                    {statusInfo.status === "failed" && (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] py-0.5 flex items-center gap-1"
                      >
                        <XCircle className="size-2.5" />
                        Failed
                      </Badge>
                    )}

                    {statusInfo.status === "pending" && (
                      <Badge
                        variant="outline"
                        className="bg-surface text-ink-muted border-accent/15 text-[10px] py-0.5 flex items-center gap-1 opacity-70"
                      >
                        <Clock className="size-2.5" />
                        Queued
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-accent/10">
          {isFinished && failCount > 0 && (
            <Button
              type="button"
              variant="outline"
              data-testid="retry-failed-btn"
              onClick={handleRetryFailed}
              className="border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-9"
            >
              <RotateCw className="size-3.5 mr-1.5" />
              Retry Failed ({failCount})
            </Button>
          )}

          <Button
            type="button"
            data-testid="close-progress-modal-btn"
            disabled={isRunning}
            onClick={handleFinish}
            className="bg-accent text-accent-foreground font-semibold text-xs h-9 px-4 ml-auto"
          >
            {isRunning ? "Processing..." : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
