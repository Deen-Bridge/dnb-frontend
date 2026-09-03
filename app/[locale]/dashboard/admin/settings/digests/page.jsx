"use client";
/**
 * Scheduled report digests configuration page (#306).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) for configuring the
 * recurring digest emails the backend sends. Mirrors the feature-flags page's
 * structure: a `PageShell` + `PageHeader`, `Card` sections, `Skeleton` loading,
 * an `EmptyState` error path, and inline field validation.
 *
 * Frontend owns configuration UX only — the backend runs the schedule and sends
 * the emails. Three sections:
 *   (a) per-type toggles (Moderation / Revenue / Signups summaries);
 *   (b) a delivery-schedule picker (day / hour / minute / timezone) with a
 *       read-only cron preview + human sentence;
 *   (c) recipient management (add email → removable chips, inline validation).
 *
 * Save is disabled while the client-side validation (`validateDigestConfig`)
 * fails, so a malformed cron-ish selection can never be submitted.
 */
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Clock,
  Mail,
  Plus,
  Save,
  ShieldAlert,
  TriangleAlert,
  X,
} from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useDigestConfig from "@/hooks/useDigestConfig";
import {
  ALLOWED_MINUTES,
  DAY_LABELS,
  isValidEmail,
  scheduleToCron,
  TIMEZONES,
} from "@/lib/actions/admin-digests";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Static copy for each digest toggle, in display order. */
const DIGEST_META = [
  {
    type: "moderation",
    label: "Moderation summary",
    description:
      "Pending reports, flagged content, and recent moderation actions.",
  },
  {
    type: "revenue",
    label: "Revenue summary",
    description: "Donations, payouts, and settlement totals for the period.",
  },
  {
    type: "signups",
    label: "Signups summary",
    description: "New learners and educators who joined since the last digest.",
  },
];

const HOURS = Array.from({ length: 24 }, (_, h) => h);

const pad2 = (n) => String(n).padStart(2, "0");

/** "Every Monday at 09:00 (UTC)" from a schedule object. */
function humanSchedule(schedule) {
  const day = DAY_LABELS[schedule?.dayOfWeek];
  if (!day || !Number.isInteger(schedule?.hour) || !Number.isInteger(schedule?.minute)) {
    return "Incomplete schedule";
  }
  return `Every ${day} at ${pad2(schedule.hour)}:${pad2(schedule.minute)} (${
    schedule.timezone || "UTC"
  })`;
}

/** One digest on/off row. */
function DigestToggleRow({ meta, enabled, onToggle }) {
  const switchId = `digest-${meta.type}`;
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-accent/10 px-4 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={switchId} className={cn(poppins_500.className, "text-ink")}>
          {meta.label}
        </Label>
        <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
          {meta.description}
        </p>
      </div>
      <Switch
        id={switchId}
        checked={enabled}
        onCheckedChange={() => onToggle(meta.type)}
        aria-label={`${enabled ? "Disable" : "Enable"} ${meta.label}`}
      />
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={cn(poppins_400.className, "text-xs text-destructive")}>
      {message}
    </p>
  );
}

function DigestsContent() {
  const {
    config,
    toggleDigest,
    setSchedule,
    addRecipient,
    removeRecipient,
    errors,
    warning,
    isValid,
    isLoading,
    isSaving,
    error,
    save,
    refresh,
  } = useDigestConfig();

  const [emailDraft, setEmailDraft] = useState("");

  const draftEmail = emailDraft.trim();
  const draftEmailError = useMemo(() => {
    if (!draftEmail) return null;
    if (!isValidEmail(draftEmail)) return "Enter a valid email address.";
    if (
      config?.recipients?.some(
        (r) => r.toLowerCase() === draftEmail.toLowerCase()
      )
    ) {
      return "That recipient is already on the list.";
    }
    return null;
  }, [draftEmail, config?.recipients]);

  const cronPreview = config ? scheduleToCron(config.schedule) : "";

  const handleAddRecipient = () => {
    if (!draftEmail || draftEmailError) return;
    if (addRecipient(draftEmail)) setEmailDraft("");
  };

  if (error) {
    return (
      <PageShell>
        <PageHeader
          icon={CalendarClock}
          title="Scheduled digests"
          subtitle="Configure recurring report emails for the admin team"
        />
        <EmptyState
          icon={ShieldAlert}
          title="Failed to load"
          description={error}
          action={
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => refresh()}
            >
              Try again
            </Button>
          }
        />
      </PageShell>
    );
  }

  if (isLoading || !config) {
    return (
      <PageShell>
        <PageHeader
          icon={CalendarClock}
          title="Scheduled digests"
          subtitle="Configure recurring report emails for the admin team"
        />
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={CalendarClock}
        title="Scheduled digests"
        subtitle="Configure recurring report emails for the admin team"
        actions={
          <Button
            type="button"
            className="rounded-full bg-accent text-white hover:bg-accent/90"
            onClick={() => save()}
            disabled={!isValid || isSaving}
          >
            <Save className="mr-1 h-4 w-4" />
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {warning && (
        <div className="flex items-center gap-2 rounded-xl border border-highlight/30 bg-highlight/10 px-4 py-2.5">
          <TriangleAlert className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" />
          <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
            {warning}
          </p>
        </div>
      )}

      {/* (a) Digest-type toggles */}
      <Card className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
        <CardHeader>
          <CardTitle className={cn(poppins_600.className, "text-ink")}>
            Report types
          </CardTitle>
          <CardDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Choose which summaries the scheduled digest includes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIGEST_META.map((meta) => (
            <DigestToggleRow
              key={meta.type}
              meta={meta}
              enabled={Boolean(config.digests?.[meta.type]?.enabled)}
              onToggle={toggleDigest}
            />
          ))}
        </CardContent>
      </Card>

      {/* (b) Delivery schedule */}
      <Card className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
        <CardHeader>
          <CardTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Clock className="h-5 w-5 text-secondary" />
            Delivery schedule
          </CardTitle>
          <CardDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Digests are sent once a week at the day and time you pick.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Day of week */}
            <div className="space-y-1.5">
              <Label htmlFor="schedule-day" className={cn(poppins_500.className, "text-ink")}>
                Day
              </Label>
              <Select
                value={String(config.schedule.dayOfWeek)}
                onValueChange={(value) => setSchedule({ dayOfWeek: Number(value) })}
              >
                <SelectTrigger
                  id="schedule-day"
                  className="w-full"
                  aria-invalid={Boolean(errors.dayOfWeek)}
                  aria-describedby="schedule-day-error"
                >
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_LABELS.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="schedule-day-error" message={errors.dayOfWeek} />
            </div>

            {/* Hour */}
            <div className="space-y-1.5">
              <Label htmlFor="schedule-hour" className={cn(poppins_500.className, "text-ink")}>
                Hour
              </Label>
              <Select
                value={String(config.schedule.hour)}
                onValueChange={(value) => setSchedule({ hour: Number(value) })}
              >
                <SelectTrigger
                  id="schedule-hour"
                  className="w-full"
                  aria-invalid={Boolean(errors.hour)}
                  aria-describedby="schedule-hour-error"
                >
                  <SelectValue placeholder="00" />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {pad2(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="schedule-hour-error" message={errors.hour} />
            </div>

            {/* Minute */}
            <div className="space-y-1.5">
              <Label htmlFor="schedule-minute" className={cn(poppins_500.className, "text-ink")}>
                Minute
              </Label>
              <Select
                value={String(config.schedule.minute)}
                onValueChange={(value) => setSchedule({ minute: Number(value) })}
              >
                <SelectTrigger
                  id="schedule-minute"
                  className="w-full"
                  aria-invalid={Boolean(errors.minute)}
                  aria-describedby="schedule-minute-error"
                >
                  <SelectValue placeholder="00" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_MINUTES.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {pad2(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="schedule-minute-error" message={errors.minute} />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label htmlFor="schedule-tz" className={cn(poppins_500.className, "text-ink")}>
                Timezone
              </Label>
              <Select
                value={config.schedule.timezone}
                onValueChange={(value) => setSchedule({ timezone: value })}
              >
                <SelectTrigger
                  id="schedule-tz"
                  className="w-full"
                  aria-invalid={Boolean(errors.timezone)}
                  aria-describedby="schedule-tz-error"
                >
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="schedule-tz-error" message={errors.timezone} />
            </div>
          </div>

          {/* Read-only preview: cron string + human sentence */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/10 bg-surface px-4 py-3">
            <span className={cn(poppins_500.className, "text-sm text-ink")}>
              {humanSchedule(config.schedule)}
            </span>
            <Badge
              variant="outline"
              className={cn(
                poppins_500.className,
                "rounded-full border-secondary/30 bg-secondary/10 text-secondary"
              )}
            >
              cron: {cronPreview}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* (c) Recipients */}
      <Card className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
        <CardHeader>
          <CardTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Mail className="h-5 w-5 text-secondary" />
            Recipients
          </CardTitle>
          <CardDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Admin email addresses that receive every scheduled digest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recipient-email" className={cn(poppins_500.className, "text-ink")}>
              Add recipient
            </Label>
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5">
                <Input
                  id="recipient-email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  placeholder="admin@deenbridge.org"
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                  aria-invalid={Boolean(draftEmailError)}
                  aria-describedby="recipient-email-error"
                />
                <FieldError id="recipient-email-error" message={draftEmailError} />
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={handleAddRecipient}
                disabled={!draftEmail || Boolean(draftEmailError)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {config.recipients.length === 0 ? (
            <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
              No recipients yet. Add at least one while a digest is enabled.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {config.recipients.map((email) => (
                <li key={email}>
                  <span
                    className={cn(
                      poppins_500.className,
                      "inline-flex items-center gap-1.5 rounded-full border border-accent/15 bg-surface px-3 py-1 text-sm text-ink"
                    )}
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      aria-label={`Remove ${email}`}
                      className="rounded-full p-0.5 text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <FieldError id="recipients-error" message={errors.recipients} />
        </CardContent>
      </Card>

      {/* Footer save (mirrors header action; disabled while invalid) */}
      <div className="flex items-center justify-end gap-3">
        {!isValid && (
          <span className={cn(poppins_400.className, "text-xs text-destructive")}>
            Fix the highlighted fields before saving.
          </span>
        )}
        <Button
          type="button"
          className="rounded-full bg-accent text-white hover:bg-accent/90"
          onClick={() => save()}
          disabled={!isValid || isSaving}
        >
          <Save className="mr-1 h-4 w-4" />
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </PageShell>
  );
}

export default function ScheduledDigestsPage() {
  return (
    <AdminTierGuard>
      <DigestsContent />
    </AdminTierGuard>
  );
}
