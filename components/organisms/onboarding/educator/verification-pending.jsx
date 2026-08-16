"use client";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2 } from "lucide-react";
import Button from "@/components/atoms/form/Button";

export default function VerificationPending() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-500/15 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Verification pending</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve received your application and are reviewing your
            documents. This usually takes a few days — you&apos;ll be notified
            once your educator account is approved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>Application submitted successfully</span>
        </div>

        <Button
          round
          wide
          data-testid="pending-go-dashboard"
          className="bg-accent hover:bg-highlight text-white"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
