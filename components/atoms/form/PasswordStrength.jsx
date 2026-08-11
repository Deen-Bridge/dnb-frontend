"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  passwordRequirements,
  passwordStrength,
} from "@/lib/validation/password";

// Green once acceptable, amber while it is on the way, red at the bottom.
// Uses theme-aware tokens so it stays readable in dark mode.
const BAR_TONES = [
  "bg-destructive",
  "bg-destructive",
  "bg-yellow-500",
  "bg-primary",
  "bg-primary",
];

const LABEL_TONES = [
  "text-destructive",
  "text-destructive",
  "text-yellow-600 dark:text-yellow-500",
  "text-primary",
  "text-primary",
];

/**
 * Live strength meter and requirement checklist.
 *
 * `name` and `email` feed the "doesn't contain your name or email" rule, so
 * pass the current values of those fields rather than the saved user.
 */
export default function PasswordStrength({
  password = "",
  name = "",
  email = "",
  className,
}) {
  if (!password) return null;

  const context = { name, email };
  const { score, label } = passwordStrength(password, context);
  const requirements = passwordRequirements(password, context);

  return (
    <div className={cn("mt-3 space-y-3", className)}>
      {/* Segmented bar — four segments so "score" maps to something countable */}
      <div>
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i < score ? BAR_TONES[score] : "bg-muted"
              )}
            />
          ))}
        </div>
        <p
          role="status"
          aria-live="polite"
          className={cn("mt-1.5 text-xs font-medium", LABEL_TONES[score])}
        >
          {label}
        </p>
      </div>

      {/* Checklist */}
      <ul className="space-y-1.5">
        {requirements.map((r) => (
          <li
            key={r.id}
            className={cn(
              "flex items-start gap-2 text-xs transition-colors",
              r.met ? "text-primary" : "text-muted-foreground"
            )}
          >
            {r.met ? (
              <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            ) : (
              <X className="mt-0.5 size-3.5 shrink-0 opacity-60" aria-hidden />
            )}
            <span>{r.label}</span>
            <span className="sr-only">{r.met ? " — met" : " — not met"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
