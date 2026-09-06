"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { config } from "@/lib/config/env";
import { normalizeRole, ROLES } from "@/lib/auth/roles";
import { persistSession } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  // Track the verified user's role so we can route them correctly.
  const [verifiedUser, setVerifiedUser] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`${config.apiUrl}/api/auth/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(data.message || "Email verified successfully!");
          if (data.accessToken && data.user) {
            persistSession(data.accessToken, data.user);
            setVerifiedUser(data.user);
          }
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("An error occurred. Please try again.");
      });
  }, [searchParams]);

  /**
   * Route based on role:
   *   educator → /educator-onboarding  (liveness verification wizard)
   *   everyone else → /dashboard
   */
  const handleContinue = () => {
    if (normalizeRole(verifiedUser?.role) === ROLES.EDUCATOR) {
      router.push("/educator-onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg aria-hidden="true" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700">Email Verified!</h1>
            <p className="text-muted-foreground">{message}</p>
            {normalizeRole(verifiedUser?.role) === ROLES.EDUCATOR && (
              <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3 text-left">
                Next step: complete a quick identity verification so your
                educator application can be reviewed.
              </p>
            )}
            <button
              onClick={handleContinue}
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-highlight transition-colors"
            >
              {normalizeRole(verifiedUser?.role) === ROLES.EDUCATOR
                ? "Continue to verification"
                : "Go to Dashboard"}
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg aria-hidden="true" className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-highlight transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
