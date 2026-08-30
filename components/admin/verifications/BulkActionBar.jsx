"use client";

import { CheckCircle, XCircle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { poppins_500, poppins_600 } from "@/lib/config/font.config";

/**
 * BulkActionBar
 * -------------
 * Floating sticky bottom toolbar displayed when one or more educators are selected
 * in the verification queue.
 *
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected educators
 * @param {number} [props.maxBatchSize=25] - Batch cap
 * @param {Function} props.onApprove - Trigger bulk approve dialog
 * @param {Function} props.onReject - Trigger bulk reject dialog
 * @param {Function} props.onClear - Clear selection
 */
export default function BulkActionBar({
  selectedCount = 0,
  maxBatchSize = 25,
  onApprove,
  onReject,
  onClear,
}) {
  if (selectedCount === 0) return null;

  const isAtCap = selectedCount >= maxBatchSize;

  return (
    <div
      data-testid="bulk-action-bar"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
        "w-[calc(100%-2rem)] max-w-2xl",
        "bg-surface-raised/95 backdrop-blur-md border border-accent/20 dark:border-accent/30 shadow-xl rounded-2xl p-3 sm:p-4",
        "flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4",
        "animate-in fade-in slide-in-from-bottom-4 duration-200"
      )}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          data-testid="selected-count-text"
          className={cn(
            poppins_600,
            "text-sm text-ink flex items-center gap-1.5"
          )}
        >
          <span className="flex items-center justify-center size-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
            {selectedCount}
          </span>
          <span>
            {selectedCount} {selectedCount === 1 ? "educator" : "educators"} selected
          </span>
        </span>

        {isAtCap && (
          <Badge
            variant="outline"
            className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 py-0.5"
          >
            <ShieldAlert className="size-3" />
            Capped at max batch ({maxBatchSize})
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          className="text-ink-muted hover:text-ink hover:bg-surface border-accent/15 text-xs h-9 px-3"
        >
          <X className="size-3.5 mr-1" />
          Clear
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onReject}
          className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs h-9 px-3.5 shadow-sm"
        >
          <XCircle className="size-3.5 mr-1.5" />
          Reject Selected ({selectedCount})
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onApprove}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 px-3.5 shadow-sm"
        >
          <CheckCircle className="size-3.5 mr-1.5" />
          Approve Selected ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
