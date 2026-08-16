"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { isEducator } from "@/lib/onboarding/educator-routing";
import { getVerificationSkipped } from "@/lib/onboarding/educator-intent";

/**
 * Surfaces the "verification incomplete" state for educators who chose
 * Skip-for-now. The server user.verificationStatus is the source of truth;
 * the localStorage flag is a fallback set by the skip path.
 */
export default function VerificationBanner() {
  const { user } = useAuth();
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    setSkipped(getVerificationSkipped());
  }, []);

  if (!isEducator(user)) return null;

  const incomplete =
    skipped ||
    ["not_started", "incomplete", "skipped"].includes(user?.verificationStatus);

  if (!incomplete) return null;

  return (
    <div
      data-testid="verification-banner"
      className="flex items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
    >
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold">
            Educator verification incomplete
          </p>
          <p className="text-xs text-muted-foreground">
            Complete verification to start publishing courses and books.
          </p>
        </div>
      </div>
      <Link
        href="/onboarding/educator/verify"
        data-testid="complete-verification"
        className="text-sm font-semibold text-accent underline underline-offset-4 whitespace-nowrap"
      >
        Complete verification
      </Link>
    </div>
  );
}
