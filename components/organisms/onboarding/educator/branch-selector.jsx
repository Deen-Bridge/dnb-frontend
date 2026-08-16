"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Clock } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { skipEducatorVerification } from "@/lib/actions/educators/application";
import { setVerificationSkipped } from "@/lib/onboarding/educator-intent";

export default function BranchSelector() {
  const router = useRouter();
  const { user } = useAuth();
  const [skipping, setSkipping] = useState(false);

  const handleVerifyNow = () => {
    router.push("/onboarding/educator/verify");
  };

  const handleSkip = () => {
    setSkipping(true);

    // Mark locally first so the dashboard banner is correct the instant we
    // land, regardless of whether the server round-trip has finished.
    setVerificationSkipped();

    // Best-effort: the server is the source of truth, but the local flag keeps
    // the dashboard banner working even if the backend call fails. Fire it
    // without awaiting so landing on the dashboard is never blocked on the
    // network; the in-flight request still completes after the soft navigation.
    skipEducatorVerification().catch(() => {
      // No toast on failure — skipping should always succeed locally.
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — become a verified educator
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Verified educators publish courses and books and get paid directly.
            Verify your identity now, or set up your account and come back
            later.
          </p>
        </div>

        <div className="grid gap-4">
          <button
            type="button"
            data-testid="verify-now"
            onClick={handleVerifyNow}
            className="group flex items-center justify-between w-full p-5 rounded-2xl border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Verify now</p>
                <p className="text-xs text-muted-foreground">
                  Liveness check, government ID, and teaching certificate
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            data-testid="skip-for-now"
            disabled={skipping}
            onClick={handleSkip}
            className="group flex items-center justify-between w-full p-5 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-colors text-left disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Skip for now</p>
                <p className="text-xs text-muted-foreground">
                  Create your account now and verify later
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can complete verification anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
