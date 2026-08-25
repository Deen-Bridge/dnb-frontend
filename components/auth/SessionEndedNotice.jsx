"use client";
/**
 * SessionEndedNotice — "expired vs revoked vs idle" banner on the login page.
 * ---------------------------------------------------------------------------
 * Reads the `?reason=` query param (set when the app bounces to login) and shows
 * a clear, reason-specific message so the user understands *why* they're back at
 * the sign-in screen. Renders nothing when there is no recognised reason.
 *
 * Copy and the destructive/default styling come from `lib/auth/session-status`
 * so the reasons stay consistent wherever they're surfaced. Because it reads
 * search params, mount it inside a `<Suspense>` boundary (Next.js 15).
 */
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  reasonMessage,
  SESSION_END_REASONS,
} from "@/lib/auth/session-status";
import { cn } from "@/lib/utils";

const REASON_ICON = {
  [SESSION_END_REASONS.SESSION_EXPIRED]: Clock,
  [SESSION_END_REASONS.SESSION_REVOKED]: ShieldAlert,
  [SESSION_END_REASONS.SESSION_IDLE]: AlertTriangle,
};

export default function SessionEndedNotice() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const copy = reasonMessage(reason);

  if (!copy) return null;

  const Icon = REASON_ICON[reason?.trim().toLowerCase()] || ShieldAlert;

  return (
    <Alert
      variant={copy.variant}
      className={cn("mb-4", copy.variant === "default" && "border-accent/20")}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{copy.message}</AlertDescription>
    </Alert>
  );
}
