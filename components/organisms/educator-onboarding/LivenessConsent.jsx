"use client";
/**
 * LivenessConsent
 * ---------------
 * Displays a plain-language biometric disclosure and requires an explicit
 * opt-in before any capture begins.
 *
 * Accessibility
 * -------------
 * - The opt-in checkbox is labelled with htmlFor.
 * - The "Start verification" button is disabled until consent is checked,
 *   with aria-disabled surfaced to assistive technology.
 * - All text is meaningful at zoom levels up to 200%.
 *
 * Security invariants
 * -------------------
 * - No capture, camera permission, or vendor SDK call happens on this screen.
 * - On "Cancel", the user is returned to the onboarding branch selector (step 1)
 *   via the onCancel prop.
 * - The consentAt timestamp is recorded in UTC milliseconds; it is passed to
 *   the backend alongside the verification token, never stored in a cookie or
 *   localStorage.
 */

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Button from "@/components/atoms/form/Button";
import { ShieldCheck, X } from "lucide-react";
import { config } from "@/lib/config/env";

/**
 * @param {Object}   props
 * @param {() => void} props.onConsent  — called with { consentAt, consentVersion }
 *                                        when the user clicks "Start verification"
 * @param {() => void} props.onCancel   — called when the user clicks "Cancel"
 */
export default function LivenessConsent({ onConsent, onCancel }) {
  const [checked, setChecked] = useState(false);

  const handleStart = () => {
    if (!checked) return;
    onConsent({
      consentAt: Date.now(),
      consentVersion: config.livenessConsentVersion,
    });
  };

  return (
    <section
      aria-labelledby="consent-heading"
      className="flex flex-col gap-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h2
          id="consent-heading"
          className="text-xl font-semibold font-stretch-125%"
        >
          Identity verification
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          To protect learners and maintain trust on the platform, all educators
          must complete a one-time liveness check before their application is
          reviewed.
        </p>
      </div>

      {/* Disclosure card */}
      <div
        role="region"
        aria-label="Biometric disclosure"
        className="rounded-xl border border-border bg-muted/40 p-5 flex flex-col gap-4 text-sm"
      >
        <h3 className="font-semibold text-base">What we capture and why</h3>

        <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed">
          <p>
            <span className="font-medium text-foreground">What is captured:</span>{" "}
            A short video of your face taken by your device camera. The video is
            analysed in real time to confirm you are a live person (not a photo
            or recording).
          </p>

          <p>
            <span className="font-medium text-foreground">Why we collect it:</span>{" "}
            This step is required to comply with our Know-Your-Educator (KYE)
            policy and to prevent fraud on the platform. It is not used for any
            other purpose.
          </p>

          <p>
            <span className="font-medium text-foreground">
              What is sent to our servers:
            </span>{" "}
            Only a short-lived verification token issued by our identity
            provider. Raw video frames and biometric vectors are{" "}
            <strong>never</strong> stored on our servers or shared with third
            parties beyond the identity verification provider.
          </p>

          <p>
            <span className="font-medium text-foreground">Retention:</span>{" "}
            The verification token and your consent record are retained for as
            long as your educator account is active, or as required by applicable
            law. You may request deletion by contacting support.
          </p>

          <p>
            <span className="font-medium text-foreground">Your rights:</span>{" "}
            You may decline this step, but doing so will prevent your educator
            application from being submitted. You can restart the process at any
            time from your account settings.
          </p>
        </div>

        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          Consent policy version{" "}
          <span className="font-mono">{config.livenessConsentVersion}</span>
        </p>
      </div>

      {/* Explicit opt-in */}
      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <Checkbox
          id="liveness-consent-checkbox"
          checked={checked}
          onCheckedChange={(val) => setChecked(Boolean(val))}
          className="mt-0.5 h-5 w-5 shrink-0"
          aria-required="true"
        />
        <Label
          htmlFor="liveness-consent-checkbox"
          className="text-sm leading-snug cursor-pointer select-none"
        >
          I understand what will be captured and why, and I give my explicit
          consent to the liveness check described above. I confirm I am at least
          18 years old.
        </Label>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          wide
          round
          onClick={handleStart}
          disabled={!checked}
          aria-disabled={!checked}
          className="bg-accent hover:bg-highlight transition-colors text-sm"
          data-testid="consent-start-btn"
        >
          Start verification
        </Button>

        <Button
          wide
          round
          onClick={onCancel}
          className="bg-transparent border border-border hover:bg-muted transition-colors text-sm text-foreground"
          data-testid="consent-cancel-btn"
        >
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </section>
  );
}
