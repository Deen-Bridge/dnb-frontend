"use client";
/**
 * Feature-flags management page (#313).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) for viewing and editing the
 * app's runtime feature flags. Mirrors the admin-team page's structure: a
 * `PageShell` + `PageHeader`, a `Table` of flags, `Skeleton` loading, an
 * `EmptyState`, and a create `Dialog` with inline validation.
 *
 * Behaviour highlights:
 *   - The state Switch toggles **optimistically** (see `useFeatureFlags`) — the
 *     UI flips instantly and reverts on failure with a toast.
 *   - **Critical (kill-switch) flags** get a destructive-tinted row + warning
 *     icon and require an explicit confirm before being turned OFF.
 *   - The create form enforces a kebab-case key that's unique against existing
 *     keys; submit stays disabled until the input is valid.
 */
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Flag as FlagIcon,
  Plus,
  ShieldAlert,
} from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/** Kebab-case key contract shared with `lib/actions/admin-flags`. */
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function updatedLabel(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function CreateFlagDialog({ open, onOpenChange, existingKeys, onCreate }) {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [rollout, setRollout] = useState("0");
  const [critical, setCritical] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedKey = key.trim();
  const keyError = useMemo(() => {
    if (!trimmedKey) return null; // empty → no error yet, just keep submit disabled
    if (!KEBAB_CASE.test(trimmedKey)) {
      return "Use lowercase kebab-case, e.g. new-checkout";
    }
    if (existingKeys.includes(trimmedKey)) {
      return "A flag with this key already exists";
    }
    return null;
  }, [trimmedKey, existingKeys]);

  const rolloutNumber = Number(rollout);
  const rolloutError =
    rollout !== "" &&
    (!Number.isFinite(rolloutNumber) || rolloutNumber < 0 || rolloutNumber > 100)
      ? "Rollout must be between 0 and 100"
      : null;

  const canSubmit =
    Boolean(trimmedKey) &&
    !keyError &&
    !rolloutError &&
    description.trim().length > 0 &&
    !isSaving;

  const reset = () => {
    setKey("");
    setDescription("");
    setRollout("0");
    setCritical(false);
    setIsSaving(false);
  };

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      await onCreate({
        key: trimmedKey,
        description: description.trim(),
        rolloutPercentage: rollout === "" ? 0 : rolloutNumber,
        critical,
      });
      reset();
      onOpenChange(false);
    } catch {
      // The hook surfaces a toast; keep the dialog open so the admin can retry.
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Plus className="h-5 w-5 text-secondary" />
            Create feature flag
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            New flags start disabled. Turn them on and dial up the rollout once
            they&apos;re ready.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="flag-key" className={cn(poppins_500.className, "text-ink")}>
              Key
            </Label>
            <Input
              id="flag-key"
              placeholder="new-checkout"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              aria-invalid={Boolean(keyError)}
              aria-describedby="flag-key-hint"
              autoComplete="off"
            />
            <p
              id="flag-key-hint"
              className={cn(
                poppins_400.className,
                "text-xs",
                keyError ? "text-destructive" : "text-ink-muted"
              )}
            >
              {keyError || "Lowercase kebab-case, unique across all flags."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="flag-description"
              className={cn(poppins_500.className, "text-ink")}
            >
              Description
            </Label>
            <Textarea
              id="flag-description"
              placeholder="What does this flag control?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="flag-rollout"
              className={cn(poppins_500.className, "text-ink")}
            >
              Rollout %
            </Label>
            <Input
              id="flag-rollout"
              type="number"
              min={0}
              max={100}
              value={rollout}
              onChange={(event) => setRollout(event.target.value)}
              aria-invalid={Boolean(rolloutError)}
              aria-describedby="flag-rollout-hint"
            />
            <p
              id="flag-rollout-hint"
              className={cn(
                poppins_400.className,
                "text-xs",
                rolloutError ? "text-destructive" : "text-ink-muted"
              )}
            >
              {rolloutError || "Share of sessions included while enabled (0-100)."}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-accent/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <div>
                <Label
                  htmlFor="flag-critical"
                  className={cn(poppins_500.className, "text-ink")}
                >
                  Critical (kill-switch)
                </Label>
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                  Requires a confirmation before being turned off.
                </p>
              </div>
            </div>
            <Switch
              id="flag-critical"
              checked={critical}
              onCheckedChange={setCritical}
              aria-label="Mark flag as critical"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              disabled={!canSubmit}
            >
              {isSaving ? "Creating…" : "Create flag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlagRow({ flag, onToggle, onRolloutCommit }) {
  const [confirmOff, setConfirmOff] = useState(false);
  const [rolloutDraft, setRolloutDraft] = useState(String(flag.rolloutPercentage));

  const handleToggle = (next) => {
    // Critical flags require confirmation before being switched OFF.
    if (flag.critical && !next) {
      setConfirmOff(true);
      return;
    }
    onToggle(flag.key, next);
  };

  const commitRollout = () => {
    const value = rolloutDraft === "" ? 0 : Number(rolloutDraft);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setRolloutDraft(String(flag.rolloutPercentage));
      return;
    }
    if (value !== flag.rolloutPercentage) {
      onRolloutCommit(flag.key, value);
    }
  };

  return (
    <>
      <TableRow
        className={cn(
          flag.critical && "border-l-2 border-l-destructive/60 bg-destructive/5"
        )}
      >
        <TableCell>
          <div className="flex items-center gap-2 py-1">
            {flag.critical && (
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-destructive"
                aria-label="Critical kill-switch flag"
              />
            )}
            <code
              className={cn(
                poppins_500.className,
                "rounded-md bg-surface px-1.5 py-0.5 text-sm text-ink"
              )}
            >
              {flag.key}
            </code>
            {flag.critical && (
              <Badge
                variant="outline"
                className="rounded-full border-destructive/30 bg-destructive/10 text-xs text-destructive"
              >
                Critical
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="max-w-sm">
          <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
            {flag.description}
          </p>
          <p className={cn(poppins_400.className, "mt-0.5 text-xs text-ink-muted/70")}>
            Updated {updatedLabel(flag.updatedAt)}
          </p>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={flag.enabled}
              onCheckedChange={handleToggle}
              aria-label={`${flag.enabled ? "Disable" : "Enable"} ${flag.key}`}
            />
            <span className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              {flag.enabled ? "On" : "Off"}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              max={100}
              value={rolloutDraft}
              onChange={(event) => setRolloutDraft(event.target.value)}
              onBlur={commitRollout}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="h-8 w-20"
              aria-label={`Rollout percentage for ${flag.key}`}
            />
            <span className={cn(poppins_400.className, "text-xs text-ink-muted")}>%</span>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={confirmOff} onOpenChange={setConfirmOff}>
        <AlertDialogContent className="border border-destructive/20 bg-surface-raised">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
            >
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Turn off a critical flag?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(poppins_400.className, "text-ink-muted")}
            >
              <code className="text-ink">{flag.key}</code> is a kill-switch flag.
              Disabling it can have broad impact across DeenBridge. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={() => onToggle(flag.key, false)}
            >
              Turn off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LoadingRows() {
  return [...Array(4)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={4} className="py-3">
        <Skeleton className="h-8 w-full rounded-full" />
      </TableCell>
    </TableRow>
  ));
}

function FlagsHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Key</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>State</TableHead>
        <TableHead>Rollout %</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function FeatureFlagsContent() {
  const { flags, isLoading, error, refresh, toggleFlag, setRollout, createFlag } =
    useFeatureFlags();
  const [createOpen, setCreateOpen] = useState(false);

  const existingKeys = useMemo(() => flags.map((flag) => flag.key), [flags]);

  return (
    <PageShell>
      <PageHeader
        icon={FlagIcon}
        title="Feature flags"
        subtitle="Toggle features, manage rollouts, and guard critical kill-switches"
        actions={
          <Button
            type="button"
            className="rounded-full bg-accent text-white hover:bg-accent/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create flag
          </Button>
        }
      />

      {error ? (
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
      ) : isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <Table>
            <FlagsHeader />
            <TableBody>{LoadingRows()}</TableBody>
          </Table>
        </div>
      ) : flags.length === 0 ? (
        <EmptyState
          icon={FlagIcon}
          title="No feature flags yet"
          description="Create your first flag to start gating features behind a switch."
          action={
            <Button
              type="button"
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create flag
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <Table>
            <FlagsHeader />
            <TableBody>
              {flags.map((flag) => (
                <FlagRow
                  key={flag.key}
                  flag={flag}
                  onToggle={toggleFlag}
                  onRolloutCommit={setRollout}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateFlagDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingKeys={existingKeys}
        onCreate={createFlag}
      />
    </PageShell>
  );
}

export default function FeatureFlagsPage() {
  return (
    <AdminTierGuard>
      <FeatureFlagsContent />
    </AdminTierGuard>
  );
}
