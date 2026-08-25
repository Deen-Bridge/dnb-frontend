"use client";
/**
 * Admin report queue (#293).
 * ---------------------------------------------------------------------------
 * Provides a structured dismissal flow for reports that do not require action.
 * The page is super-admin gated and delegates data/mutations to
 * `useAdminReports`, keeping the future backend integration isolated.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, Flag, MessageSquare, Send, XCircle } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useAdminReports from "@/hooks/useAdminReports";
import {
  DISMISSAL_REASONS,
  getDefaultNotificationPreference,
} from "@/lib/actions/admin-reports";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

function ReportCard({ report, onDismiss, isDismissing }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-accent/10 bg-surface-raised p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Flag className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className={cn(poppins_500.className, "text-sm text-ink")}>{report.subject}</h2>
            <p className={cn(poppins_400.className, "mt-1 text-xs text-ink-muted")}>
              Report #{report.id} · {report.contentType}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full border-amber-500/20 bg-amber-500/10 text-amber-600">
          Pending review
        </Badge>
      </div>

      <p className={cn(poppins_400.className, "mt-4 text-sm text-ink-muted")}>
        {report.contentPreview}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-accent/10 pt-3">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Reported by {report.reporter.name}
            {report.reporter.priorReportCount > 0 && " · repeat reporter"}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setOpen(true)}
          disabled={isDismissing}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Dismiss report
        </Button>
      </div>

      <DismissReportDialog
        report={report}
        open={open}
        onOpenChange={setOpen}
        onDismiss={onDismiss}
        isDismissing={isDismissing}
      />
    </article>
  );
}

function DismissReportDialog({ report, open, onOpenChange, onDismiss, isDismissing }) {
  const [reason, setReason] = useState("");
  const [notifyReporter, setNotifyReporter] = useState(
    getDefaultNotificationPreference(report.reporter)
  );

  useEffect(() => {
    if (open) {
      setReason("");
      setNotifyReporter(getDefaultNotificationPreference(report.reporter));
    }
  }, [open, report.reporter]);

  const handleOpenChange = (next) => {
    if (!next && !isDismissing) onOpenChange(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reason || isDismissing) return;

    try {
      await onDismiss({
        reportId: report.id,
        reason,
        notifyReporter,
      });
      onOpenChange(false);
    } catch {
      // The hook owns the user-facing error toast and keeps the dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}>
            <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
            Dismiss report #{report.id}
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Choose why this report does not require moderation action. This decision
            is recorded in the admin audit log.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor={`dismiss-reason-${report.id}`} className={cn(poppins_500.className, "text-ink")}>
              Dismissal reason
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id={`dismiss-reason-${report.id}`} className="w-full" aria-label="Dismissal reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISMISSAL_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-accent/10 p-3">
            <Checkbox
              id={`notify-reporter-${report.id}`}
              checked={notifyReporter}
              onCheckedChange={(checked) => setNotifyReporter(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor={`notify-reporter-${report.id}`} className={cn(poppins_500.className, "cursor-pointer text-ink")}>
                Send courtesy notification to reporter
              </Label>
              <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                {notifyReporter
                  ? "The reporter will receive a short confirmation that the report was reviewed."
                  : "No notification will be sent for this dismissal."}
              </p>
            </div>
          </div>

          <p className={cn(poppins_400.className, "flex items-start gap-2 text-xs text-ink-muted")}>
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
            {report.reporter.priorReportCount > 0
              ? "Notifications default off for repeat reporters to prevent spam."
              : "Notifications default on for first-time reporters to maintain trust."}
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              disabled={!reason || isDismissing}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isDismissing ? "Dismissing..." : "Dismiss report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingReports() {
  return ["one", "two"].map((key) => (
    <div key={key} className="rounded-xl border border-accent/10 bg-surface-raised p-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  ));
}

function ReportsContent() {
  const { reports, isLoading, isDismissing, error, refresh, dismiss } = useAdminReports();

  return (
    <PageShell>
      <PageHeader
        icon={Flag}
        title="Report queue"
        subtitle="Review community reports and dismiss those that do not require moderation action"
        actions={
          <Button type="button" variant="outline" className="rounded-full" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load reports"
          description={error}
          action={
            <Button type="button" variant="outline" className="rounded-full" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="space-y-4">{LoadingReports()}</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No pending reports"
          description="All current reports have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDismiss={dismiss}
              isDismissing={isDismissing}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function ReportsPage() {
  return (
    <AdminTierGuard>
      <ReportsContent />
    </AdminTierGuard>
  );
}
