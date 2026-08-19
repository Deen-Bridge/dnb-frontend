"use client";
/**
 * Verification Status Center
 * --------------------------
 * Full-detail view of an educator's verification lifecycle.
 *
 * Sections
 * --------
 *   1. Header — gradient icon + title + live status badge
 *   2. Current status panel — human-readable explanation + primary action
 *   3. Rejection reason panel — shown only when status === "rejected"
 *   4. Submission timeline — sequential steps with timestamps
 *   5. Submitted documents — masked (filename/type only); signed-URL
 *      fetch on demand via "View" button; never a public link
 *   6. Resubmit action — shown for rejected state
 *
 * Design tokens follow the established account-page pattern:
 *   Panel, CardHead, poppins_* fonts, gradient header, ink/surface colors.
 *
 * Backend dependency: dnb-backend#92.
 * While that PR is pending, the mock adapter + 404 fallback in
 * fetchVerificationStatus.js keeps this page rendering in dev.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import {
  VERIFICATION_STATUS,
  fetchDocumentSignedUrl,
} from "@/lib/actions/educators/fetchVerificationStatus";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";

// ── Design-system building blocks (matching security / notifications pages) ─

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const CardHead = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-3 border-b border-accent/10 p-5 sm:p-6">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {desc && (
        <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>{desc}</p>
      )}
    </div>
  </div>
);

// ── Status badge ────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  [VERIFICATION_STATUS.NOT_STARTED]: {
    label: "Not started",
    className: "border-ink-muted/30 bg-surface text-ink-muted",
  },
  [VERIFICATION_STATUS.INCOMPLETE]: {
    label: "Incomplete",
    className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300",
  },
  [VERIFICATION_STATUS.PENDING]: {
    label: "Pending review",
    className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-950/40 dark:text-blue-300",
  },
  [VERIFICATION_STATUS.UNDER_REVIEW]: {
    label: "Under review",
    className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-950/40 dark:text-blue-300",
  },
  [VERIFICATION_STATUS.REJECTED]: {
    label: "Rejected",
    className: "border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300",
  },
  [VERIFICATION_STATUS.VERIFIED]: {
    label: "Verified",
    className: "border-green-300 bg-green-50 text-green-700 dark:border-green-700/50 dark:bg-green-950/40 dark:text-green-300",
  },
};

// ── Status explanation copy ─────────────────────────────────────────────────

const STATUS_COPY = {
  [VERIFICATION_STATUS.NOT_STARTED]: {
    icon: BadgeCheck,
    heading: "Identity verification required",
    detail:
      "To list courses and receive payments, all educators must complete a one-time identity verification. It takes under two minutes.",
    ctaLabel: "Start verification",
    ctaIcon: BadgeCheck,
    ctaVariant: "amber",
  },
  [VERIFICATION_STATUS.INCOMPLETE]: {
    icon: AlertCircle,
    heading: "Verification in progress",
    detail:
      "You started verification but didn't finish. Your progress has been saved — pick up right where you left off.",
    ctaLabel: "Continue verification",
    ctaIcon: RefreshCw,
    ctaVariant: "amber",
  },
  [VERIFICATION_STATUS.PENDING]: {
    icon: Clock,
    heading: "Application submitted",
    detail:
      "Your identity check is complete and your application is in the review queue. We'll notify you once a decision is made.",
    ctaLabel: null,
    ctaIcon: null,
    ctaVariant: null,
  },
  [VERIFICATION_STATUS.UNDER_REVIEW]: {
    icon: Clock,
    heading: "Application under review",
    detail:
      "Our compliance team is reviewing your application. This typically takes 1–2 business days. No action is needed from you right now.",
    ctaLabel: null,
    ctaIcon: null,
    ctaVariant: null,
  },
  [VERIFICATION_STATUS.REJECTED]: {
    icon: ShieldAlert,
    heading: "Application not approved",
    detail:
      "Your application did not pass the review. Please read the feedback below, address the issue, and resubmit.",
    ctaLabel: "Resubmit application",
    ctaIcon: RefreshCw,
    ctaVariant: "red",
  },
  [VERIFICATION_STATUS.VERIFIED]: {
    icon: ShieldCheck,
    heading: "Identity verified",
    detail:
      "Your educator identity has been confirmed. You can now list courses and receive USDC payments.",
    ctaLabel: null,
    ctaIcon: null,
    ctaVariant: null,
  },
};

// ── Timeline step ───────────────────────────────────────────────────────────

function TimelineStep({ step, isLast }) {
  return (
    <li className="relative flex gap-4">
      {/* Connector line */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-8 h-full w-px bg-accent/15"
        />
      )}

      {/* Dot */}
      <div
        className={cn(
          "relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2",
          step.done
            ? "border-secondary bg-secondary/10"
            : "border-accent/20 bg-surface"
        )}
        aria-hidden="true"
      >
        {step.done ? (
          <BadgeCheck className="h-4 w-4 text-secondary" />
        ) : (
          <Clock className="h-4 w-4 text-ink-muted/50" />
        )}
      </div>

      {/* Content */}
      <div className="pb-6">
        <p className={cn(poppins_500, "text-sm text-ink leading-snug")}>
          {step.label}
        </p>
        {step.ts ? (
          <p className={cn(poppins_400, "mt-0.5 text-xs text-ink-muted")}>
            {format(new Date(step.ts), "dd MMM yyyy, HH:mm")} (
            {formatDistanceToNow(new Date(step.ts), { addSuffix: true })})
          </p>
        ) : (
          <p className={cn(poppins_400, "mt-0.5 text-xs text-ink-muted/60")}>
            Not yet reached
          </p>
        )}
      </div>
    </li>
  );
}

// ── Document row ────────────────────────────────────────────────────────────

function DocumentRow({ doc }) {
  const [fetching, setFetching] = useState(false);

  const handleView = useCallback(async () => {
    setFetching(true);
    try {
      const { signedUrl } = await fetchDocumentSignedUrl(doc.id);
      // Open in new tab — signed URL, time-limited, never stored
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.message ?? "Could not load document");
    } finally {
      setFetching(false);
    }
  }, [doc.id]);

  return (
    <div
      data-testid="document-row"
      className="flex items-center justify-between gap-4 rounded-xl border border-accent/10 bg-surface p-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
          <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          {/* Masked filename — only name+extension, no path */}
          <p
            className={cn(poppins_500, "truncate text-sm text-ink")}
            title={doc.filename}
          >
            {doc.filename}
          </p>
          <p className={cn(poppins_400, "text-xs text-ink-muted capitalize")}>
            {doc.type?.replace(/_/g, " ")}
            {doc.uploadedAt && (
              <> · {format(new Date(doc.uploadedAt), "dd MMM yyyy")}</>
            )}
          </p>
        </div>
      </div>

      {/* View via signed URL — never a public link */}
      <Button
        round
        disabled={fetching}
        onClick={handleView}
        data-testid="doc-view-btn"
        className="shrink-0 bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent/20"
      >
        {fetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Eye className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            View
          </>
        )}
      </Button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const router = useRouter();
  const {
    status,
    data,
    loading,
    error,
    resumeStep,
    refresh,
    isVerified,
  } = useVerificationStatus();

  const cfg = STATUS_COPY[status] ?? STATUS_COPY[VERIFICATION_STATUS.NOT_STARTED];
  const badgeCfg = STATUS_BADGE[status] ?? STATUS_BADGE[VERIFICATION_STATUS.NOT_STARTED];

  const handleCta = useCallback(() => {
    if (
      status === VERIFICATION_STATUS.NOT_STARTED ||
      status === VERIFICATION_STATUS.INCOMPLETE
    ) {
      router.push(`/educator-onboarding?step=${resumeStep}`);
    } else if (status === VERIFICATION_STATUS.REJECTED) {
      // Resubmit: clear the wizard state and restart from step 1
      router.push("/educator-onboarding?step=1");
    }
  }, [router, status, resumeStep]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    toast.success("Status refreshed");
  }, [refresh]);

  return (
    <div className="min-h-full bg-surface p-3 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
                )}
              >
                Verification
              </h1>
              <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                Your educator identity and application status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live status badge */}
            <Badge
              data-testid="status-badge"
              className={cn("rounded-full px-3 py-1 text-xs", badgeCfg.className)}
            >
              {badgeCfg.label}
            </Badge>

            {/* Manual refresh */}
            <button
              onClick={handleRefresh}
              aria-label="Refresh verification status"
              data-testid="refresh-btn"
              className="rounded-lg border border-accent/15 bg-surface p-2 text-ink-muted transition-colors hover:border-accent/30 hover:text-accent"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-accent/10 bg-surface-raised"
              />
            ))}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────── */}
        {!loading && error && (
          <Panel>
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
              <p className={cn(poppins_500, "text-sm text-ink")}>
                Could not load verification status
              </p>
              <p className={cn(poppins_400, "text-xs text-ink-muted")}>{error}</p>
              <Button
                round
                onClick={handleRefresh}
                className="mt-2 bg-accent px-5 text-sm text-white hover:bg-highlight"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          </Panel>
        )}

        {!loading && !error && (
          <>
            {/* ── Current status panel ────────────────────────────────── */}
            <Panel data-testid="status-panel">
              <CardHead
                icon={cfg.icon}
                title={cfg.heading}
                desc={cfg.detail}
              />

              {/* Verified checkmark */}
              {isVerified && (
                <div className="flex items-center gap-2 p-5 sm:p-6">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <BadgeCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className={cn(poppins_500, "text-sm text-green-700 dark:text-green-400")}>
                    You are a verified educator on Deen Bridge.
                  </p>
                </div>
              )}

              {/* CTA row */}
              {cfg.ctaLabel && (
                <div className="border-t border-accent/10 p-5 sm:p-6">
                  <Button
                    round
                    wide={false}
                    onClick={handleCta}
                    data-testid="status-cta-btn"
                    className={cn(
                      "px-6 text-sm text-white",
                      cfg.ctaVariant === "red"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-accent hover:bg-highlight"
                    )}
                  >
                    {cfg.ctaIcon && (
                      <cfg.ctaIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    )}
                    {cfg.ctaLabel}
                  </Button>
                </div>
              )}
            </Panel>

            {/* ── Rejection reason panel ───────────────────────────────── */}
            {status === VERIFICATION_STATUS.REJECTED && data?.rejectionReason && (
              <Panel data-testid="rejection-panel">
                <CardHead
                  icon={ShieldAlert}
                  title="Review feedback"
                  desc="Address the points below before resubmitting."
                />
                <div className="p-5 sm:p-6">
                  <blockquote
                    className={cn(
                      poppins_400,
                      "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300"
                    )}
                  >
                    {data.rejectionReason}
                  </blockquote>
                  {data.reviewedAt && (
                    <p className={cn(poppins_400, "mt-2 text-xs text-ink-muted")}>
                      Reviewed{" "}
                      {formatDistanceToNow(new Date(data.reviewedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </Panel>
            )}

            {/* ── Submission timeline ──────────────────────────────────── */}
            {data?.timeline && data.timeline.length > 0 && (
              <Panel data-testid="timeline-panel">
                <CardHead
                  icon={Clock}
                  title="Application timeline"
                  desc="Track the progress of your educator application."
                />
                <div className="p-5 sm:p-6">
                  <ol aria-label="Application timeline" className="list-none">
                    {data.timeline.map((step, idx) => (
                      <TimelineStep
                        key={step.status}
                        step={step}
                        isLast={idx === data.timeline.length - 1}
                      />
                    ))}
                  </ol>
                </div>
              </Panel>
            )}

            {/* ── Submitted documents ──────────────────────────────────── */}
            {data?.documents && data.documents.length > 0 && (
              <Panel data-testid="documents-panel">
                <CardHead
                  icon={FileText}
                  title="Submitted documents"
                  desc="Documents are accessible only via a time-limited secure link."
                />
                <div className="space-y-3 p-5 sm:p-6">
                  {data.documents.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}

                  {/* Compliance notice */}
                  <p
                    className={cn(
                      poppins_400,
                      "mt-2 text-xs text-ink-muted/70"
                    )}
                  >
                    <ExternalLink
                      className="mr-1 inline h-3 w-3"
                      aria-hidden="true"
                    />
                    Document links expire after a short period. Each click
                    generates a fresh secure URL — your files are never exposed
                    on a public link.
                  </p>
                </div>
              </Panel>
            )}

            {/* ── Empty state for non-educators or not_started ─────────── */}
            {status === VERIFICATION_STATUS.NOT_STARTED &&
              !data?.documents?.length && (
                <Panel data-testid="empty-panel">
                  <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                      <ShieldCheck className="h-7 w-7 text-accent" />
                    </div>
                    <p className={cn(poppins_600, "text-ink")}>
                      No application yet
                    </p>
                    <p
                      className={cn(
                        poppins_400,
                        "max-w-sm text-sm text-ink-muted"
                      )}
                    >
                      Once you start the verification process, your application
                      details will appear here.
                    </p>
                    <Button
                      round
                      onClick={handleCta}
                      data-testid="empty-panel-cta-btn"
                      className="mt-2 bg-accent px-6 text-sm text-white hover:bg-highlight"
                    >
                      <BadgeCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Start verification
                    </Button>
                  </div>
                </Panel>
              )}
          </>
        )}
      </div>
    </div>
  );
}
