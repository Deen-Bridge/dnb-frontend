"use client";
/**
 * LivenessCapture
 * ---------------
 * Manages the full capture lifecycle after consent has been recorded.
 *
 * State machine
 * -------------
 *   capturing → success       (adapter resolves with { ok: true, token })
 *   capturing → failure       (adapter rejects with { ok: false, reason: "failure" })
 *   capturing → timeout       (adapter takes longer than config.livenessTimeoutSeconds)
 *   failure   → capturing     (user clicks Retry)
 *   timeout   → capturing     (user clicks Retry)
 *   *         → cancelled     (user clicks Cancel — navigates back to step 1)
 *
 * Security invariants
 * -------------------
 * - verificationToken is forwarded to the context (in-memory only) on success
 *   and immediately cleared after the backend call (submitLiveness).
 * - Raw frames/vectors are NEVER written here; the adapter owns capture entirely.
 * - No biometric data is written to localStorage, sessionStorage, or cookies.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, X } from "lucide-react";
import Button from "@/components/atoms/form/Button";
import { config } from "@/lib/config/env";
import { getLivenessAdapter } from "@/lib/verification/liveness";
import { useEducatorOnboarding } from "@/components/providers/EducatorOnboardingProvider";
import { submitLiveness } from "@/lib/actions/educators/submitLiveness";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

// Internal capture phases (mirrors the reducer phases in the provider)
const Phase = /** @type {const} */ ({
  CAPTURING: "capturing",
  SUCCESS: "success",
  FAILURE: "failure",
  TIMEOUT: "timeout",
});

/**
 * @param {Object}   props
 * @param {() => void} props.onSuccess  — called after the backend acknowledges the token
 * @param {() => void} props.onCancel   — called when user cancels; returns to step 1
 */
export default function LivenessCapture({ onSuccess, onCancel }) {
  const { consentRecord, setVerificationToken, clearVerificationToken, setError, retry: ctxRetry } =
    useEducatorOnboarding();
  const { user } = useAuth();

  const [phase, setPhase] = useState(Phase.CAPTURING);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const adapterRef = useRef(null);
  const timeoutRef = useRef(null);

  // ── Start / restart capture ───────────────────────────────────────────────
  const startCapture = useCallback(() => {
    // Clean up any previous adapter instance
    adapterRef.current?.cancel();
    clearTimeout(timeoutRef.current);

    setPhase(Phase.CAPTURING);
    setErrorMessage(null);

    const adapter = getLivenessAdapter();
    adapterRef.current = adapter;

    const session = {
      userId: user?._id ?? "unknown",
      consentVersion: consentRecord?.consentVersion ?? config.livenessConsentVersion,
      consentAt: consentRecord?.consentAt ?? Date.now(),
      timeoutMs: config.livenessTimeoutSeconds * 1000,
    };

    // ── Timeout guard ────────────────────────────────────────────────────────
    // The adapter is responsible for honouring session.timeoutMs, but we also
    // enforce it here at the UI layer as a belt-and-suspenders measure.
    timeoutRef.current = setTimeout(() => {
      adapter.cancel(); // signals the adapter to emit its timeout result
      // If the adapter doesn't emit via onResult, we handle it directly:
      setPhase(Phase.TIMEOUT);
      setErrorMessage("Verification timed out. Please try again.");
      setError({ phase: "timeout", message: "Verification timed out." });
    }, session.timeoutMs);

    // ── Result handler ────────────────────────────────────────────────────────
    adapter.onResult((result) => {
      clearTimeout(timeoutRef.current);

      if (result.ok) {
        // Token is held in memory only — forwarded to backend immediately.
        setVerificationToken(result.token);
        handleSuccess(result.token, session);
      } else {
        const newPhase =
          result.reason === "timeout" ? Phase.TIMEOUT : Phase.FAILURE;
        setPhase(newPhase);
        setErrorMessage(
          result.message ??
            (result.reason === "timeout"
              ? "Verification timed out. Please try again."
              : "Liveness check did not pass. Please try again.")
        );
        setError({ phase: newPhase, message: result.message });
      }
    });

    // Start the adapter — some providers resolve via the promise, others via
    // onResult callback; both paths are handled.
    adapter.start(session).catch((err) => {
      clearTimeout(timeoutRef.current);
      if (err?.reason === "cancelled") return; // user-initiated, already handled
      const newPhase = err?.reason === "timeout" ? Phase.TIMEOUT : Phase.FAILURE;
      setPhase(newPhase);
      setErrorMessage(
        err?.message ??
          (newPhase === Phase.TIMEOUT
            ? "Verification timed out. Please try again."
            : "Liveness check did not pass. Please try again.")
      );
      setError({ phase: newPhase, message: err?.message });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, consentRecord, retryCount]);

  // ── Submit token to backend ───────────────────────────────────────────────
  const handleSuccess = useCallback(
    async (token, session) => {
      setPhase(Phase.SUCCESS);
      setSubmitting(true);

      try {
        await submitLiveness({
          userId: session.userId,
          verificationToken: token,
          consentAt: session.consentAt,
          consentVersion: session.consentVersion,
        });

        toast.success("Identity verified successfully!");
        onSuccess();
      } catch (err) {
        toast.error(err?.message ?? "Failed to submit verification. Please retry.");
        setPhase(Phase.FAILURE);
        setErrorMessage(
          err?.message ?? "Could not submit your verification. Please try again."
        );
      } finally {
        // SECURITY: clear the token from context as soon as the backend has it.
        clearVerificationToken();
        setSubmitting(false);
      }
    },
    [onSuccess, clearVerificationToken]
  );

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    ctxRetry();
    setRetryCount((c) => c + 1);
    // startCapture is triggered via the effect below when retryCount changes
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    adapterRef.current?.cancel();
    clearTimeout(timeoutRef.current);
    clearVerificationToken();
    onCancel();
  };

  // ── Mount / retry trigger ─────────────────────────────────────────────────
  useEffect(() => {
    startCapture();

    return () => {
      adapterRef.current?.cancel();
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]); // re-run on retry

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      aria-labelledby="capture-heading"
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center gap-6 max-w-md mx-auto text-center"
    >
      {/* ── Capturing ─────────────────────────────────────────────────────── */}
      {phase === Phase.CAPTURING && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Loader2
              className="h-10 w-10 text-accent animate-spin"
              aria-hidden="true"
            />
          </div>
          <h2
            id="capture-heading"
            className="text-xl font-semibold font-stretch-125%"
          >
            Verifying your identity…
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Please follow the on-screen prompts. Keep your face centred and
            ensure your environment is well-lit.
          </p>
          <p className="text-xs text-muted-foreground">
            This step will time out after{" "}
            <strong>{config.livenessTimeoutSeconds} seconds</strong>.
          </p>
          <Button
            wide
            round
            onClick={handleCancel}
            className="bg-transparent border border-border hover:bg-muted transition-colors text-sm text-foreground"
            data-testid="capture-cancel-btn"
          >
            <X className="mr-1 h-4 w-4" aria-hidden="true" />
            Cancel
          </Button>
        </>
      )}

      {/* ── Success (submitting) ───────────────────────────────────────────── */}
      {phase === Phase.SUCCESS && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            {submitting ? (
              <Loader2
                className="h-10 w-10 text-green-600 dark:text-green-400 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-10 w-10 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            )}
          </div>
          <h2
            id="capture-heading"
            className="text-xl font-semibold font-stretch-125%"
          >
            {submitting ? "Submitting verification…" : "Verified!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {submitting
              ? "Securely forwarding your verification result."
              : "Your identity has been confirmed. Continuing…"}
          </p>
        </>
      )}

      {/* ── Failure ───────────────────────────────────────────────────────── */}
      {phase === Phase.FAILURE && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle
              className="h-10 w-10 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          </div>
          <h2
            id="capture-heading"
            className="text-xl font-semibold font-stretch-125% text-red-700 dark:text-red-400"
          >
            Verification failed
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            {errorMessage ??
              "The liveness check did not pass. Please ensure your face is clearly visible and try again."}
          </p>
          <div
            className="flex flex-col gap-3 w-full sm:flex-row-reverse"
            role="group"
            aria-label="Retry or cancel"
          >
            <Button
              wide
              round
              onClick={handleRetry}
              className="bg-accent hover:bg-highlight transition-colors text-sm"
              data-testid="capture-retry-btn"
            >
              <RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button
              wide
              round
              onClick={handleCancel}
              className="bg-transparent border border-border hover:bg-muted transition-colors text-sm text-foreground"
              data-testid="capture-cancel-btn"
            >
              <X className="mr-1 h-4 w-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* ── Timeout ───────────────────────────────────────────────────────── */}
      {phase === Phase.TIMEOUT && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock
              className="h-10 w-10 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          </div>
          <h2
            id="capture-heading"
            className="text-xl font-semibold font-stretch-125% text-amber-700 dark:text-amber-400"
          >
            Verification timed out
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            The verification step did not complete in time. Please check your
            connection and try again.
          </p>
          <div
            className="flex flex-col gap-3 w-full sm:flex-row-reverse"
            role="group"
            aria-label="Retry or cancel"
          >
            <Button
              wide
              round
              onClick={handleRetry}
              className="bg-accent hover:bg-highlight transition-colors text-sm"
              data-testid="capture-retry-btn"
            >
              <RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button
              wide
              round
              onClick={handleCancel}
              className="bg-transparent border border-border hover:bg-muted transition-colors text-sm text-foreground"
              data-testid="capture-cancel-btn"
            >
              <X className="mr-1 h-4 w-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
