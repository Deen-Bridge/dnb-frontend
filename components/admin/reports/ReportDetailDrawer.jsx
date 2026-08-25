"use client";
/**
 * ReportDetailDrawer — the full-context moderation view for one report (#289).
 * ---------------------------------------------------------------------------
 * A right-side drawer (Sheet) that gathers everything a moderator needs to
 * decide, in one place and at high density:
 *   - the reported content, previewed inline and matched to its type
 *     (`ReportedContentPreview`),
 *   - the reporter's statement plus trust signals (account age, prior report
 *     count — a serial-reporter flag),
 *   - the target's history (prior reports against it, prior admin actions),
 *   - an action rail: Escalate, Dismiss, or Apply action (takedown) to target,
 *     the last behind a confirm step because it is destructive.
 *
 * All mutations are delegated to the `useReports` hook passed down from the
 * page, so the drawer, the list, and the audit trail stay consistent.
 */
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  ShieldAlert,
  Flag,
  Clock,
  History,
  Gavel,
  ArrowUpCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ReportedContentPreview from "@/components/admin/reports/ReportedContentPreview";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Serial-reporter threshold above which the prior-report count is flagged. */
const SERIAL_REPORTER_THRESHOLD = 5;

/** Humanize an audit-style action code like "content.takedown". */
function humanizeAction(code) {
  if (!code) return "Action";
  return code
    .split(/[._]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ status }) {
  const variant =
    status === "escalated" ? "destructive" : status === "open" ? "default" : "secondary";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return <Badge variant={variant}>{label}</Badge>;
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className={cn(poppins_600.className, "flex items-center gap-2 text-sm text-ink")}>
      <Icon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
      {children}
    </h3>
  );
}

export default function ReportDetailDrawer({ report, open, onOpenChange, reports }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!report) return null;

  const { reporter, target } = report;
  const busy = reports.pendingId === report.id;
  const resolved = report.status === "dismissed" || report.status === "actioned";

  const accountAge = reporter?.accountCreatedAt
    ? formatDistanceToNow(new Date(reporter.accountCreatedAt), { addSuffix: false })
    : "unknown";
  const isSerialReporter = (reporter?.priorReportCount || 0) >= SERIAL_REPORTER_THRESHOLD;

  const runAndMaybeClose = async (fn) => {
    try {
      await fn();
      onOpenChange(false);
    } catch {
      // Toast already surfaced by the hook; keep the drawer open to retry.
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="space-y-1 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <SheetTitle className={cn(poppins_600.className, "text-base text-ink")}>
              Report {report.id}
            </SheetTitle>
            <StatusBadge status={report.status} />
          </div>
          <SheetDescription className={cn(poppins_400.className, "flex flex-wrap items-center gap-2 text-ink-muted")}>
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{report.reason}</span>
            <span aria-hidden="true">·</span>
            <span>filed {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-4">
          {/* Reported content — inline, type-matched preview */}
          <section className="space-y-2">
            <SectionTitle icon={Gavel}>Reported content</SectionTitle>
            <ReportedContentPreview target={target} />
            <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              Owner: <span className="text-ink">{target?.ownerName}</span>
            </p>
          </section>

          <Separator />

          {/* Reporter — statement + trust signals */}
          <section className="space-y-2">
            <SectionTitle icon={ShieldAlert}>Reporter</SectionTitle>
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={reporter?.avatar} alt="" />
                <AvatarFallback>{(reporter?.name || "?").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn(poppins_500.className, "text-sm text-ink")}>{reporter?.name}</span>
                  <span className={cn(poppins_400.className, "inline-flex items-center gap-1 text-xs text-ink-muted")}>
                    <Clock className="h-3 w-3" aria-hidden="true" /> account {accountAge} old
                  </span>
                  <Badge variant={isSerialReporter ? "destructive" : "secondary"} className="gap-1">
                    {isSerialReporter ? <AlertTriangle className="h-3 w-3" aria-hidden="true" /> : null}
                    {reporter?.priorReportCount || 0} prior reports
                  </Badge>
                </div>
                <blockquote className={cn(poppins_400.className, "rounded-md border-l-2 border-border bg-muted/40 px-3 py-2 text-sm text-ink")}>
                  {reporter?.statement}
                </blockquote>
              </div>
            </div>
          </section>

          <Separator />

          {/* Target history — prior reports + prior admin actions */}
          <section className="space-y-2">
            <SectionTitle icon={History}>Target history</SectionTitle>

            <div className="space-y-1">
              <p className={cn(poppins_500.className, "text-xs uppercase tracking-wide text-ink-muted")}>
                Prior reports ({target?.priorReports?.length || 0})
              </p>
              {target?.priorReports?.length ? (
                <ul className="space-y-1">
                  {target.priorReports.map((pr) => (
                    <li
                      key={pr.id}
                      className={cn(poppins_400.className, "flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs")}
                    >
                      <span className="truncate text-ink">{pr.reason}</span>
                      <span className="flex shrink-0 items-center gap-2 text-ink-muted">
                        <span>{format(new Date(pr.createdAt), "d MMM yyyy")}</span>
                        <StatusBadge status={pr.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>No prior reports on this target.</p>
              )}
            </div>

            <div className="space-y-1 pt-1">
              <p className={cn(poppins_500.className, "text-xs uppercase tracking-wide text-ink-muted")}>
                Prior admin actions ({target?.priorActions?.length || 0})
              </p>
              {target?.priorActions?.length ? (
                <ul className="space-y-1">
                  {target.priorActions.map((pa) => (
                    <li
                      key={pa.id}
                      className={cn(poppins_400.className, "flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs")}
                    >
                      <span className="truncate text-ink">{humanizeAction(pa.action)}</span>
                      <span className="flex shrink-0 items-center gap-2 text-ink-muted">
                        <span>{format(new Date(pa.at), "d MMM yyyy")}</span>
                        <span>{pa.by}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>No prior admin actions on this target.</p>
              )}
            </div>
          </section>
        </div>

        {/* Action rail — pinned at the bottom of the drawer */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 p-4 backdrop-blur">
          {resolved ? (
            <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
              This report has been {report.status}. No further action needed.
            </p>
          ) : (
            <>
              <Button
                variant="outline"
                className="gap-1"
                disabled={busy}
                onClick={() => runAndMaybeClose(() => reports.escalate(report.id))}
              >
                <ArrowUpCircle className="h-4 w-4" aria-hidden="true" /> Escalate
              </Button>
              <Button
                variant="secondary"
                className="gap-1"
                disabled={busy}
                onClick={() => runAndMaybeClose(() => reports.dismiss(report.id))}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" /> Dismiss
              </Button>

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="ml-auto gap-1" disabled={busy}>
                    <Gavel className="h-4 w-4" aria-hidden="true" /> Apply action to target
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                      Take down reported content?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes &ldquo;{target?.title}&rdquo; ({target?.type}) and marks the
                      report as actioned. The action is recorded in the audit log. You can
                      restore the content later from moderation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => runAndMaybeClose(() => reports.applyAction(report.id, "takedown"))}
                    >
                      Take down
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
