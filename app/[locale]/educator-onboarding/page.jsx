"use client";
/**
 * Educator Onboarding Wizard
 * ---------------------------
 * Three-step wizard for educators after email verification:
 *
 *   Step 1 — Branch selector ("verify now" vs "later")
 *   Step 2 — Consent screen (liveness disclosure + explicit opt-in)
 *   Step 3 — Capture + state machine (liveness check)
 *   Step 4 — Document upload, at /educator-onboarding/documents
 *
 * Step 4 lives on its own route rather than in this state machine so it stays
 * resumable and deep-linkable. The admin review console (#38) remains out of
 * scope here.
 *
 * Navigation contract
 * -------------------
 *   • "Start verification"  → step 2 (consent)
 *   • Consent given         → step 3 (capture)
 *   • Cancel at any point   → step 1 (branch selector)
 *   • Capture success       → /educator-onboarding/documents (step 4)
 *   • "Do this later"       → /dashboard
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clock } from "lucide-react";

import EducatorOnboardingProvider, {
  useEducatorOnboarding,
} from "@/components/providers/EducatorOnboardingProvider";
import LivenessConsent from "@/components/organisms/educator-onboarding/LivenessConsent";
import LivenessCapture from "@/components/organisms/educator-onboarding/LivenessCapture";
import Button from "@/components/atoms/form/Button";

// ---------------------------------------------------------------------------
// Step 1 — Branch selector
// ---------------------------------------------------------------------------
function BranchSelector({ onVerifyNow, onLater }) {
  return (
    <section
      aria-labelledby="branch-heading"
      className="flex flex-col gap-8 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h1
          id="branch-heading"
          className="text-2xl font-bold font-stretch-125%"
        >
          Educator verification
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          To list courses and receive USDC payments, all educators must complete
          a one-time identity verification. It takes under two minutes.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Primary CTA */}
        <button
          onClick={onVerifyNow}
          data-testid="branch-verify-now-btn"
          className="flex items-start gap-4 rounded-xl border-2 border-accent bg-accent/5 p-5 text-left transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ShieldCheck
            className="mt-0.5 h-6 w-6 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-sm">Verify now</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete a quick liveness check so your application can be
              reviewed immediately.
            </p>
          </div>
        </button>

        {/* Secondary — defer */}
        <button
          onClick={onLater}
          data-testid="branch-later-btn"
          className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Clock
            className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-sm">Do this later</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Skip for now and complete verification from your account settings.
              You won&apos;t be able to submit an application until it&apos;s
              done.
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Step indicators (accessibility: aria-current on active dot)
// ---------------------------------------------------------------------------
function StepDots({ current, total }) {
  return (
    <nav aria-label="Onboarding progress" className="flex justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-current={i + 1 === current ? "step" : undefined}
          className={`h-2 w-2 rounded-full transition-colors ${
            i + 1 === current
              ? "bg-accent w-6"
              : i + 1 < current
              ? "bg-accent/40"
              : "bg-muted-foreground/30"
          }`}
        />
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Slide animation wrapper
// ---------------------------------------------------------------------------
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

// ---------------------------------------------------------------------------
// Inner wizard — consumes context
// ---------------------------------------------------------------------------
function WizardInner() {
  const router = useRouter();
  const { step, goToStep, recordConsent, revokeConsent } =
    useEducatorOnboarding();

  // Step 1 → 2
  const handleVerifyNow = useCallback(() => goToStep(2), [goToStep]);

  // Any cancel → back to step 1
  const handleCancel = useCallback(() => {
    revokeConsent();
    goToStep(1);
  }, [goToStep, revokeConsent]);

  // Consent screen submits consent record → step 3 (capture)
  const handleConsent = useCallback(
    (record) => {
      recordConsent(record); // also transitions phase → "capturing"
      goToStep(3);
    },
    [recordConsent, goToStep]
  );

  // Capture success → document upload (step 4)
  const handleCaptureSuccess = useCallback(() => {
    router.push("/educator-onboarding/documents");
  }, [router]);

  // "Later" → dashboard
  const handleLater = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex flex-col">
      {/* Only show dots on steps 2+ */}
      {step > 1 && <StepDots current={step - 1} total={2} />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          {step === 1 && (
            <BranchSelector
              onVerifyNow={handleVerifyNow}
              onLater={handleLater}
            />
          )}

          {step === 2 && (
            <LivenessConsent
              onConsent={handleConsent}
              onCancel={handleCancel}
            />
          )}

          {step === 3 && (
            <LivenessCapture
              onSuccess={handleCaptureSuccess}
              onCancel={handleCancel}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — wraps with provider
// ---------------------------------------------------------------------------
export default function EducatorOnboardingPage() {
  return (
    <EducatorOnboardingProvider>
      <WizardInner />
    </EducatorOnboardingProvider>
  );
}
