"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Lock,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  checkRateLimit,
  recordActionAttempt,
} from "@/lib/utils/rateLimiter";
import { cn } from "@/lib/utils";

export default function StepUpConfirmModal({
  open,
  onOpenChange,
  title = "Confirm Sensitive Action",
  description = "This action is destructive and irreversible. Please verify by typing the phrase below.",
  targetName = "",
  actionVerb = "CONFIRM",
  expectedPhrase: customExpectedPhrase,
  confirmVariant = "destructive",
  confirmText = "Confirm Action",
  onConfirm,
  rateLimitKey = "admin_sensitive_action",
}) {
  const [typedPhrase, setTypedPhrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  // Derive expected phrase from actionVerb & targetName if not custom
  const expectedPhrase = useMemo(() => {
    if (customExpectedPhrase) return customExpectedPhrase;
    const verb = actionVerb ? actionVerb.toUpperCase() : "CONFIRM";
    return targetName ? `${verb} ${targetName}` : verb;
  }, [customExpectedPhrase, actionVerb, targetName]);

  // Check rate limit on open and set up cooldown timer if active
  useEffect(() => {
    if (!open) {
      setTypedPhrase("");
      setIsSubmitting(false);
      return;
    }

    const rateStatus = checkRateLimit(rateLimitKey);
    if (!rateStatus.allowed) {
      setCooldownSec(rateStatus.cooldownSec);
    } else {
      setCooldownSec(0);
    }
  }, [open, rateLimitKey]);

  // Countdown timer interval for active cooldown
  useEffect(() => {
    if (cooldownSec <= 0) return;

    const timer = setInterval(() => {
      setCooldownSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSec]);

  const isMatched = typedPhrase.trim() === expectedPhrase;
  const isBlockedByCooldown = cooldownSec > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatched || isBlockedByCooldown || isSubmitting) return;

    // Check rate limit right before submitting
    const rateStatus = checkRateLimit(rateLimitKey);
    if (!rateStatus.allowed) {
      setCooldownSec(rateStatus.cooldownSec);
      return;
    }

    setIsSubmitting(true);
    try {
      recordActionAttempt(rateLimitKey);
      if (onConfirm) {
        await onConfirm(expectedPhrase);
      }
      onOpenChange(false);
    } catch (err) {
      console.error("Step-up action error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground pt-1">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Target & Expected Phrase Display */}
          <div className="p-3 border rounded-lg bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Target Record:</span>
              <Badge variant="outline" className="font-mono text-[11px]">
                {targetName || "N/A"}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Type exact phrase to authorize:
              </span>
              <p className="font-mono font-bold text-xs bg-background p-2 rounded border select-all text-red-600 dark:text-red-400 break-all">
                {expectedPhrase}
              </p>
            </div>
          </div>

          {/* Rate Limit Cooldown Notice Alert */}
          {isBlockedByCooldown && (
            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold">Rapid Confirm Cooldown Active</p>
                <p className="text-[11px] mt-0.5">
                  Multiple rapid destructive actions detected. Please wait{" "}
                  <span className="font-bold font-mono text-amber-900 dark:text-amber-200">
                    {cooldownSec}s
                  </span>{" "}
                  before confirming.
                </p>
              </div>
            </div>
          )}

          {/* Typed Verification Input */}
          <div className="space-y-1.5">
            <Label htmlFor="stepUpInput" className="text-xs font-semibold flex items-center justify-between">
              <span>Verification Phrase</span>
              {isMatched && (
                <span className="text-green-600 dark:text-green-400 text-[11px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Exact Match
                </span>
              )}
            </Label>
            <Input
              id="stepUpInput"
              type="text"
              placeholder={`Type "${expectedPhrase}"`}
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              disabled={isBlockedByCooldown || isSubmitting}
              autoComplete="off"
              className={cn(
                "text-xs font-mono transition-colors",
                isMatched && "border-green-500 focus-visible:ring-green-500 bg-green-50/20"
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={confirmVariant}
              size="sm"
              disabled={!isMatched || isBlockedByCooldown || isSubmitting}
              className="gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : isBlockedByCooldown ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Cooldown ({cooldownSec}s)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{confirmText}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
