"use client";
/**
 * ReauthPromptDialog — password step-up prompt for sensitive actions (#337).
 * ---------------------------------------------------------------------------
 * Presentational dialog driven by `useReauth`. It collects the current admin's
 * password and calls `onConfirm(password)`; on success the parent hook closes it
 * and lets the sensitive action proceed, on failure it surfaces the error inline
 * and stays open so the admin can retry. Cancel/escape/close never proceed.
 *
 * Usage:
 *   const { ensureFreshSession, reauthProps } = useReauth();
 *   <ReauthPromptDialog {...reauthProps} />
 */
import { useEffect, useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

export default function ReauthPromptDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm it's you",
  description = "Your session has been active for a while. Re-enter your password to continue with this sensitive action.",
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Never carry a typed password or error across opens.
  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const canSubmit = password.trim().length > 0 && !isSubmitting;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm?.(password);
      // Parent (useReauth) closes the dialog on success.
    } catch (err) {
      setError(err?.message || "Re-authentication failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange?.(next)}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <ShieldAlert className="h-5 w-5 text-secondary" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="reauth-password"
              className={cn(poppins_500.className, "text-ink")}
            >
              Password
            </Label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <Input
                id="reauth-password"
                type="password"
                className="pl-9"
                placeholder="Your account password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "reauth-error" : undefined}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p
                id="reauth-error"
                className={cn(poppins_400.className, "text-xs text-destructive")}
              >
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isSubmitting}
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Verifying…" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
