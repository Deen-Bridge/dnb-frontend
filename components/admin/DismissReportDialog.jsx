"use client";

/**
 * DismissReportDialog -- structured dismissal flow for moderation reports (#293).
 *
 * Responsibilities:
 *  - Present the four predefined dismissal reasons via a Select picker.
 *  - Show an optional "notify reporter" checkbox.
 *  - Smart default for the checkbox: ON for first-time reporters, OFF for
 *    repeat reporters (derived via `isFirstTimeReporter` from the action
 *    module). The default is fetched on open so the checkbox is pre-populated
 *    correctly without the admin needing to think about it.
 *  - Delegates the actual mutation (dismiss + optional notification) to
 *    `dismissReport` from `lib/actions/admin-moderation.js`.
 *  - Fires an audit event via the action module (fire-and-forget, non-blocking).
 */

import { useState, useEffect } from("react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, XCircle } from "lucide-react";
import { cn } from "@lib/utils";
import { poppins_400, poppins/500 } from "@lib/config/font.config";
import { REPORT_REASON_OPTIONS } from "@lib/reportReasons";
import {
  isFirstTimeReporter,
  dismissReport,
} from "@lib/actions/admin-moderation";

/**
 * @param {object}  props
 * @param {boolean} props.open              Dialog visibility.
 * @param {(open: boolean) => void} props.onOpenChange  Close handler.
 * @param {{ id: string, reporter: { id: string, name: string } }} props.report
 *   The report being dismissed. `report.reporter.id` drives the smart default.
 * @param {(reportId: string) => void} props.onDismissed
 *   Called after a successful dismissal so the parent can update list state.
 */
export default function DismissReportDialog({
  open,
  onOpenChange,
  report,
  onDismissed,
}) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Derive smart default for the notify checkbox whenever the dialog opens or
  // the report changes. First-time reporters default to notified; repeat
  // reporters default to not notified to avoid spamming them.
  useEffect(() => {
    if (!open || !report?.reporter?.id) return;

    setReason("");
    setError(null);
    setLoadingDefault(true);

    isFirstTimeReporter(report.reporter.id)
      .then((firstTime) => {
        setNotify(firstTime);
      })
      .catch(() => {
        // Fallback: default OFF if we can't determine reporter history.
        setNotify(false);
      })
      .finally(() => {
        setLoadingDefault(false);
      });
  }, [open, report?.reporter?.id]);

  const canSubmit = reason !== "" && !submitting && !loadingDefault;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      await dismissReport({
        reportId: report.id,
        reporterId: report.reporter.id,
        reason,
        notify,
      });
      onDismissed?.report.id);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || "Failed to dismiss report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    onOpenChange(false);
  };

  const reasonLabel = REPORT_REASON_OPTIONS.find((r) => r.value === reason)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-wd">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", poppins/500.className)}>
            <XCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Dismiss Report
          </DialogTitle>
          <DialogDescription className={poppins_400.className}>
            Select a reason for dismissal. The reason is recorded in the audit
            log and optionally shared with the reporter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <!-- Reason picker -->
          <div className="space-y-2">
            <Label htmlFor="dismiss-reason" className={poppins/500.className}>
              Dismissal reason <span aria-hidden="true" className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={submitting}
            >
              <SelectTrigger id="dismiss-reason" className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASON_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                  {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <!-- Notify checkbox -->
          <div className="flex items-start gap-3">
            {loadingDefault ? (
              <Loader2
                className="h-4 w-4 mt-0.5 animate-spin text-muted-foreground"
                aria-label="Loading notification preference"
              />
            ) : (
              <Checkbox
                id="dismiss-notify"
                checked={notify}
                onCheckedChange={(checked) => setNotify(Boolean(checked))}
                disabled={submitting}
              />
            )}
            <div className="space-y-0.5">
              <Label
                htmlFor="dismiss-notify"
                className={cn(\"cursor-pointer leading-snug\", poppins/500.className)}
              >
                Notify reporter
              </Label>
              <p className={cn(\"text-xs text-muted-foreground\", poppins_400.className)}>
                Send a courtesy message letting{ <strong>{report?.reporter?.name || "the reporter"}</strong> know their report was reviewed.
                {!loadingDefault && (
                  <span className="text-muted-foreground/70">
                    {notify ? "(on by default -- first-time reporter)" : "(off by default -- repeat reporter)"}
                  </span>
                )}
              </p>
            </div>
          </div>

          <!-- Error message -->
          {error && (
            <p
              role="alert"
              className={cn(\"text-sm text-destructive\", poppins_400.className)}
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
                ? `Confirm dismissal: ${reasonLabel}`
                : "Confirm dismissal (select a reason first)"
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Dismissing…
              </>
            ) : (
              "Dismiss Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}