"use client";

import { useId, useState } from "react";
import { AlertTriangle, Loader2, OctagonX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { emergencyStopLiveSpace } from "@/lib/actions/admin-spaces";

export default function EmergencyStopSpaceDialog({
  space,
  actor,
  disabled = false,
  onOutcome,
}) {
  const confirmationId = useId();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const confirmationMatches = confirmation === space.roomName;
  const canSubmit = confirmationMatches && Boolean(reason.trim()) && !pending;

  function resetForm() {
    setConfirmation("");
    setReason("");
    setOutcome(null);
  }

  function handleOpenChange(nextOpen) {
    if (pending) return;
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  async function handleEmergencyStop() {
    if (!canSubmit) return;

    setPending(true);
    setOutcome(null);

    try {
      const result = await emergencyStopLiveSpace(space, { reason, actor });
      const warnings = result.warnings || [];
      const nextOutcome = {
        kind: result.status === "ended" ? "success" : "warning",
        message: [result.message, ...warnings].join(" "),
        result,
      };
      setOutcome(nextOutcome);
      onOutcome?.(nextOutcome);
      setOpen(false);
      setConfirmation("");
      setReason("");
    } catch (error) {
      const auditNote = error.auditLogged
        ? " The failed attempt was recorded in the audit log."
        : " The audit entry could not be recorded."
      const nextOutcome = {
        kind: "error",
        message: `${error.message || "The live space could not be ended."}${auditNote}`,
        error,
      };
      setOutcome(nextOutcome);
      onOutcome?.(nextOutcome);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            disabled={disabled}
            className="gap-2"
          >
            <OctagonX className="h-4 w-4" aria-hidden="true" />
            Emergency stop
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>End this live space immediately?</AlertDialogTitle>
            <AlertDialogDescription>
              This is an emergency moderation action. Participants may be disconnected
              without warning. The reason and outcome will be written to the admin audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={reasonId}>Reason for emergency stop</Label>
              <textarea
                id={reasonId}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={pending}
                rows={3}
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the policy or safety issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={confirmationId}>
                Type <span className="font-semibold text-foreground">{space.roomName}</span> to confirm
              </Label>
              <Input
                id={confirmationId}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={pending}
                autoComplete="off"
                aria-describedby={`${confirmationId}-help`}
              />
              <p id={`${confirmationId}-help`} className="text-xs text-muted-foreground">
                The room name must match exactly, including capitalization and spaces.
              </p>
            </div>

            {outcome?.kind === "error" ? (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {outcome.message}
              </div>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!canSubmit}
              onClick={handleEmergencyStop}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Ending space…
                </>
              ) : (
                "End space now"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {outcome && outcome.kind !== "error" ? (
        <div
          role="status"
          className={
            outcome.kind === "success"
              ? "rounded-md border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm text-emerald-700"
              : "rounded-md border border-amber-600/30 bg-amber-600/10 p-3 text-sm text-amber-700"
          }
        >
          {outcome.message}
        </div>
      ) : null}
    </div>
  );
}
