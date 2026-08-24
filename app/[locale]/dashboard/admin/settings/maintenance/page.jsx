"use client";
/**
 * Maintenance-mode settings page (#303).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) to toggle platform-wide
 * maintenance mode, attach an optional learner-facing message and ETA, review
 * who last changed it, and preview the exact lock screen learners will see.
 *
 * All reads/writes go through the shared `useMaintenanceMode` hook (the same
 * hook the `MaintenanceGate` admin bar uses), so the toggle here and the bar
 * stay consistent. Mutations surface sonner toasts from the hook.
 */
import { useEffect, useState } from "react";
import { Wrench, ShieldAlert, Clock, Save } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import MaintenanceScreen from "@/components/maintenance/MaintenanceScreen";
import useMaintenanceMode from "@/hooks/useMaintenanceMode";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/** Convert an ISO timestamp to a `datetime-local` input value (local tz). */
function isoToLocalInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

/** Convert a `datetime-local` input value (local tz) back to an ISO string. */
function localInputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function updatedLabel(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function MaintenanceContent() {
  const { maintenance, isLoading, isSaving, enable, disable, setState } =
    useMaintenanceMode();

  const [message, setMessage] = useState("");
  const [etaLocal, setEtaLocal] = useState("");

  // Seed the draft fields from the server state after each load / save. Keyed on
  // `updatedAt` so an in-progress edit isn't clobbered until the next round-trip.
  useEffect(() => {
    if (!maintenance) return;
    setMessage(maintenance.message || "");
    setEtaLocal(isoToLocalInput(maintenance.etaAt));
  }, [maintenance?.updatedAt]);

  const enabled = Boolean(maintenance?.enabled);
  const etaIso = localInputToIso(etaLocal);

  const handleToggle = async (next) => {
    try {
      if (next) {
        await enable({ message: message.trim() || null, etaAt: etaIso });
      } else {
        await disable();
      }
    } catch {
      // Hook already surfaced a toast.
    }
  };

  const handleSave = async () => {
    try {
      await setState({
        enabled,
        message: message.trim() || null,
        etaAt: etaIso,
      });
    } catch {
      // Hook already surfaced a toast.
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={Wrench}
        title="Maintenance mode"
        subtitle="Put the platform behind a friendly lock screen while you work — admins keep full access."
      />

      {/* Current status */}
      <div className="rounded-2xl border border-accent/10 bg-surface-raised p-5 shadow-sm">
        {isLoading ? (
          <Skeleton className="h-6 w-48 rounded-full" />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full",
                  enabled
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                )}
              >
                {enabled ? "Maintenance ON" : "Live — normal operation"}
              </Badge>
              <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                {maintenance?.updatedBy?.name
                  ? `Last changed by ${maintenance.updatedBy.name} `
                  : "Last changed "}
                {updatedLabel(maintenance?.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isSaving}
                aria-label={
                  enabled ? "Disable maintenance mode" : "Enable maintenance mode"
                }
              />
              <span className={cn(poppins_500.className, "text-sm text-ink")}>
                {enabled ? "On" : "Off"}
              </span>
            </div>
          </div>
        )}
      </div>

      {enabled ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <ShieldAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
            Maintenance is <strong className="text-ink">active</strong>. Learners
            and logged-out visitors see the lock screen below; admins keep
            working behind the persistent maintenance bar.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5 rounded-2xl border border-accent/10 bg-surface-raised p-5 shadow-sm">
          <div className="space-y-1.5">
            <Label
              htmlFor="maintenance-message"
              className={cn(poppins_500.className, "text-ink")}
            >
              Custom message (optional)
            </Label>
            <Textarea
              id="maintenance-message"
              placeholder="We're upgrading the library — back shortly, in shaa Allah."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              maxLength={280}
            />
            <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              Shown to learners on the lock screen. Leave blank for the default
              copy. {message.length}/280
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="maintenance-eta"
              className={cn(poppins_500.className, "flex items-center gap-1.5 text-ink")}
            >
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              Back-online ETA (optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="maintenance-eta"
                type="datetime-local"
                value={etaLocal}
                onChange={(event) => setEtaLocal(event.target.value)}
                className="max-w-xs"
              />
              {etaLocal ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setEtaLocal("")}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              Drives the live &ldquo;Back in ~1h 12m&rdquo; countdown on the lock
              screen.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="rounded-full bg-accent text-white hover:bg-accent/90"
            >
              <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        {/* Live learner preview */}
        <div className="space-y-2">
          <p
            className={cn(
              poppins_600.className,
              "flex items-center gap-2 text-sm text-ink"
            )}
          >
            Learner preview
            <Badge
              variant="outline"
              className="rounded-full border-accent/20 text-xs text-ink-muted"
            >
              Live
            </Badge>
          </p>
          <div className="relative h-[440px] overflow-hidden rounded-2xl border border-accent/10 shadow-sm">
            <div className="pointer-events-none absolute left-0 top-0 w-[166.67%] origin-top-left scale-[0.6]">
              <MaintenanceScreen
                message={message.trim() || null}
                etaAt={etaIso}
              />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function MaintenanceSettingsPage() {
  return (
    <AdminTierGuard>
      <MaintenanceContent />
    </AdminTierGuard>
  );
}
