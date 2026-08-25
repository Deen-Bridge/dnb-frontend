"use client";
/**
 * Session-security settings page (#337).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) for editing the configurable
 * admin session-hardening values that drive `AdminIdleGuard` and the re-auth
 * prompt: the idle timeout, the warning lead time, and the re-auth age.
 *
 * Mirrors the feature-flags settings page: a `PageShell` + `PageHeader`, a
 * `Skeleton` loading state, an `EmptyState` on load failure, and a validated
 * form that saves through the stubbed `admin-session-config` service with
 * `sonner` toasts. Validation is client-side (mirroring
 * `validateSessionSecurityConfig`) with the submit button disabled until valid.
 */
import { useEffect, useMemo, useState } from "react";
import { Clock, KeyRound, ShieldCheck, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import {
  getSessionSecurityConfig,
  updateSessionSecurityConfig,
  validateSessionSecurityConfig,
  DEFAULT_SESSION_SECURITY_CONFIG,
} from "@/lib/actions/admin-session-config";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** One field's controlled number input with an inline hint / error. */
function ConfigField({
  id,
  icon: Icon,
  label,
  unit,
  hint,
  value,
  error,
  onChange,
  min,
  max,
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={cn(poppins_500.className, "text-ink")}>
        <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          className="max-w-[8rem]"
        />
        <span className={cn(poppins_400.className, "text-sm text-ink-muted")}>
          {unit}
        </span>
      </div>
      <p
        id={`${id}-hint`}
        className={cn(
          poppins_400.className,
          "text-xs",
          error ? "text-destructive" : "text-ink-muted"
        )}
      >
        {error || hint}
      </p>
    </div>
  );
}

function SessionSecurityContent() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields are kept as strings so the inputs stay controlled while typing.
  const [form, setForm] = useState({
    idleTimeoutMinutes: "",
    idleWarningSeconds: "",
    reauthAfterMinutes: "",
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const cfg = await getSessionSecurityConfig();
      setForm({
        idleTimeoutMinutes: String(cfg.idleTimeoutMinutes),
        idleWarningSeconds: String(cfg.idleWarningSeconds),
        reauthAfterMinutes: String(cfg.reauthAfterMinutes),
      });
    } catch (err) {
      setLoadError(err?.message || "Failed to load session-security settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (name) => (value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  // Parse to numbers and validate with the same rules the service enforces.
  const numeric = useMemo(
    () => ({
      idleTimeoutMinutes: Number(form.idleTimeoutMinutes),
      idleWarningSeconds: Number(form.idleWarningSeconds),
      reauthAfterMinutes: Number(form.reauthAfterMinutes),
    }),
    [form]
  );

  const { valid, errors } = useMemo(
    () => validateSessionSecurityConfig(numeric),
    [numeric]
  );

  const handleReset = () => {
    setForm({
      idleTimeoutMinutes: String(
        DEFAULT_SESSION_SECURITY_CONFIG.idleTimeoutMinutes
      ),
      idleWarningSeconds: String(
        DEFAULT_SESSION_SECURITY_CONFIG.idleWarningSeconds
      ),
      reauthAfterMinutes: String(
        DEFAULT_SESSION_SECURITY_CONFIG.reauthAfterMinutes
      ),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!valid || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await updateSessionSecurityConfig(numeric);
      setForm({
        idleTimeoutMinutes: String(saved.idleTimeoutMinutes),
        idleWarningSeconds: String(saved.idleWarningSeconds),
        reauthAfterMinutes: String(saved.reauthAfterMinutes),
      });
      toast.success("Session-security settings saved");
    } catch (err) {
      toast.error(err?.message || "Couldn't save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={ShieldCheck}
        title="Session security"
        subtitle="Tune idle-timeout and re-authentication rules for admin sessions"
      />

      {loadError ? (
        <EmptyState
          icon={ShieldCheck}
          title="Failed to load"
          description={loadError}
          action={
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={load}
            >
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <div className="max-w-xl space-y-6 rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-w-xl space-y-6 rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm"
        >
          <ConfigField
            id="idle-timeout-minutes"
            icon={Clock}
            label="Idle timeout"
            unit="minutes"
            hint="Sign admins out after this much inactivity."
            value={form.idleTimeoutMinutes}
            error={errors.idleTimeoutMinutes}
            onChange={setField("idleTimeoutMinutes")}
            min={1}
            max={480}
          />

          <ConfigField
            id="idle-warning-seconds"
            icon={TimerReset}
            label="Warning lead time"
            unit="seconds"
            hint="Show the countdown warning this long before the timeout."
            value={form.idleWarningSeconds}
            error={errors.idleWarningSeconds}
            onChange={setField("idleWarningSeconds")}
            min={5}
            max={600}
          />

          <ConfigField
            id="reauth-after-minutes"
            icon={KeyRound}
            label="Re-authentication age"
            unit="minutes"
            hint="Require a password re-entry for sensitive actions once the session is older than this."
            value={form.reauthAfterMinutes}
            error={errors.reauthAfterMinutes}
            onChange={setField("reauthAfterMinutes")}
            min={1}
            max={1440}
          />

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="submit"
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              disabled={!valid || isSaving}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset to defaults
            </Button>
          </div>
          <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
            These rules apply to admin sessions only. The backend remains the
            source of truth for session validity.
          </p>
        </form>
      )}
    </PageShell>
  );
}

export default function SessionSecurityPage() {
  return (
    <AdminTierGuard>
      <SessionSecurityContent />
    </AdminTierGuard>
  );
}
