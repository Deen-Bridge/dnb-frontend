"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ScanFace, CheckCircle2 } from "lucide-react";
import Button from "@/components/atoms/form/Button";
import { requestLivenessToken } from "@/lib/actions/educators/application";

export default function LivenessStep({ setValue, watch, errors }) {
  const [checking, setChecking] = useState(false);
  const token = watch("livenessToken");

  const startCheck = async () => {
    setChecking(true);
    try {
      const res = await requestLivenessToken();
      if (res?.token) {
        setValue("livenessToken", res.token, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        throw new Error(res?.message || "Liveness check failed");
      }
    } catch (err) {
      toast.error(err?.message || "Liveness check failed. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Liveness check</h3>
        <p className="text-sm text-muted-foreground">
          Confirm you&apos;re a real person with a quick face check. This token
          is bound to your application and is never reused.
        </p>
      </div>

      <div className="p-5 border rounded-2xl bg-card space-y-4 text-center">
        <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
          <ScanFace className="w-8 h-8 text-accent" />
        </div>

        {token ? (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-accent">
            <CheckCircle2 className="w-5 h-5" />
            Liveness check passed
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You&apos;ll be guided through a short face capture.
          </p>
        )}

        <Button
          type="button"
          round
          wide
          data-testid="start-liveness"
          loading={checking}
          disabled={checking || !!token}
          onClick={startCheck}
          className="bg-accent hover:bg-highlight text-white"
        >
          {token ? "Check completed" : "Start face check"}
        </Button>

        {errors.livenessToken && (
          <p className="text-xs text-red-500 font-medium">
            {errors.livenessToken.message}
          </p>
        )}
      </div>
    </div>
  );
}
