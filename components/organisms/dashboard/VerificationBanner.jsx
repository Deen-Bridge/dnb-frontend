"use client";
/**
 * VerificationBanner
 * ------------------
 * A dismissible/snoozable dashboard banner shown to educators whose
 * verification is not yet complete. Status-aware copy for every state.
 *
 * States rendered
 * ---------------
 *   not_started / incomplete  → amber  "Complete your verification" + resume CTA
 *   pending / under_review    → blue   "Your application is under review"
 *   rejected                  → red    "Action required" + resubmit CTA
 *   verified                  → banner never mounts (hook returns isBannerVisible=false)
 *
 * Accessibility
 * -------------
 *   role="alert" so screen readers announce status changes.
 *   All interactive controls are keyboard-reachable.
 *   aria-label on icon-only buttons.
 *
 * Security
 * --------
 *   Snooze/dismiss are client-side only (localStorage).
 *   No biometric data is ever present here.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  ChevronRight,
  Clock,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { VERIFICATION_STATUS } from "@/lib/actions/educators/fetchVerificationStatus";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";

// ── Per-status config ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [VERIFICATION_STATUS.NOT_STARTED]: {
    icon: BadgeCheck,
    palette: {
      wrapper: "border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30",
      icon: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      title: "text-amber-900 dark:text-amber-200",
      body: "text-amber-800 dark:text-amber-300",
      cta: "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400",
      dismiss: "text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200",
    },
    title: "Verify your educator identity",
    body: "Complete a quick one-time verification so your application can be reviewed and you can start listing courses.",
    ctaLabel: "Start verification",
    showSnooze: true,
  },
  [VERIFICATION_STATUS.INCOMPLETE]: {
    icon: AlertCircle,
    palette: {
      wrapper: "border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30",
      icon: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      title: "text-amber-900 dark:text-amber-200",
      body: "text-amber-800 dark:text-amber-300",
      cta: "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400",
      dismiss: "text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200",
    },
    title: "Finish your verification",
    body: "You started but haven't completed the verification process. Pick up exactly where you left off.",
    ctaLabel: "Continue verification",
    showSnooze: true,
  },
  [VERIFICATION_STATUS.PENDING]: {
    icon: Clock,
    palette: {
      wrapper: "border-blue-200 bg-blue-50 dark:border-blue-700/40 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      title: "text-blue-900 dark:text-blue-200",
      body: "text-blue-800 dark:text-blue-300",
      cta: null,
      dismiss: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200",
    },
    title: "Verification submitted",
    body: "Your application is queued for review. We'll notify you as soon as a decision is made.",
    ctaLabel: null,
    showSnooze: false,
  },
  [VERIFICATION_STATUS.UNDER_REVIEW]: {
    icon: Clock,
    palette: {
      wrapper: "border-blue-200 bg-blue-50 dark:border-blue-700/40 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      title: "text-blue-900 dark:text-blue-200",
      body: "text-blue-800 dark:text-blue-300",
      cta: null,
      dismiss: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200",
    },
    title: "Under review",
    body: "Our team is reviewing your application. This usually takes 1–2 business days. No action needed.",
    ctaLabel: null,
    showSnooze: false,
  },
  [VERIFICATION_STATUS.REJECTED]: {
    icon: ShieldAlert,
    palette: {
      wrapper: "border-red-200 bg-red-50 dark:border-red-700/40 dark:bg-red-950/30",
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/40",
      title: "text-red-900 dark:text-red-200",
      body: "text-red-800 dark:text-red-300",
      cta: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400",
      dismiss: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200",
    },
    title: "Verification needs attention",
    body: "Your application was not approved. Review the feedback in the status center and resubmit.",
    ctaLabel: "View details & resubmit",
    showSnooze: false,
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function VerificationBanner() {
  const router = useRouter();
  const {
    status,
    data,
    loading,
    isBannerVisible,
    resumeStep,
    snooze,
    dismiss,
  } = useVerificationStatus();

  const cfg = STATUS_CONFIG[status];

  const handleCta = useCallback(() => {
    if (status === VERIFICATION_STATUS.REJECTED) {
      // Deep-link to the status center for rejected state
      router.push("/account/verification");
    } else {
      // Resume the onboarding wizard at the correct step
      router.push(`/educator-onboarding?step=${resumeStep}`);
    }
  }, [router, status, resumeStep]);

  // Skeleton while loading — keeps layout stable
  if (loading) {
    return (
      <div
        aria-busy="true"
        className="rounded-2xl border border-accent/10 bg-surface-raised p-4 sm:p-5 animate-pulse h-20"
      />
    );
  }

  if (!isBannerVisible || !cfg) return null;

  const { icon: Icon, palette, title, body, ctaLabel, showSnooze } = cfg;

  return (
    <AnimatePresence>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="alert"
        aria-live="polite"
        data-testid="verification-banner"
        data-status={status}
        className={cn(
          "rounded-2xl border p-4 sm:p-5",
          "flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4",
          palette.wrapper
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            palette.iconBg
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-5 w-5", palette.icon)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn(poppins_600, "text-sm leading-snug", palette.title)}>
            {title}
          </p>
          <p className={cn(poppins_400, "text-sm leading-relaxed", palette.body)}>
            {body}
          </p>

          {/* Rejection reason inline preview */}
          {status === VERIFICATION_STATUS.REJECTED && data?.rejectionReason && (
            <p
              className={cn(
                poppins_400,
                "mt-1 rounded-lg border border-red-200 bg-white/60 px-3 py-2 text-xs dark:border-red-800/40 dark:bg-red-950/40",
                palette.body
              )}
            >
              <span className={cn(poppins_500, "mr-1")}>Reason:</span>
              {data.rejectionReason}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:flex-nowrap">
          {/* Primary CTA */}
          {ctaLabel && (
            <button
              onClick={handleCta}
              data-testid="banner-cta-btn"
              className={cn(
                poppins_500,
                "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                palette.cta
              )}
            >
              {status === VERIFICATION_STATUS.REJECTED ? (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {ctaLabel}
            </button>
          )}

          {/* Snooze (24h) */}
          {showSnooze && (
            <button
              onClick={snooze}
              data-testid="banner-snooze-btn"
              className={cn(
                poppins_400,
                "rounded-lg px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2",
                palette.dismiss
              )}
            >
              Remind me later
            </button>
          )}

          {/* Dismiss */}
          <button
            onClick={dismiss}
            aria-label="Dismiss banner"
            data-testid="banner-dismiss-btn"
            className={cn(
              "rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2",
              palette.dismiss
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
