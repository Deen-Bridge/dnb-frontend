"use client";
/**
 * Emergency broadcast quick-action (#307).
 * ---------------------------------------------------------------------------
 * Admin surface (wrapped in `AdminTierGuard`) to fire a one-click incident
 * alert during an outage or security event. Optimized for SPEED — the whole
 * flow is: tap a template → (optionally tweak title / ETA / affected areas) →
 * type the confirmation phrase → Send. An IMMEDIATE send (no scheduling); the
 * learner-side red `EmergencyBroadcastBanner` picks it up from the same session
 * store.
 *
 * A typed confirmation phrase guards the destructive action, and the whole page
 * carries a distinct red/destructive treatment so the admin always knows this
 * is high-severity — visually distinct from the amber maintenance surface.
 */
import { useMemo, useState } from "react";
import {
  Siren,
  AlertTriangle,
  Clock,
  Send,
  ServerCrash,
  ShieldAlert,
  Check,
} from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import useEmergencyBroadcast from "@/hooks/useEmergencyBroadcast";
import {
  INCIDENT_TEMPLATES,
  AFFECTED_AREAS,
  labelForAreas,
} from "@/lib/actions/admin-emergency-broadcast";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Phrase the admin must type verbatim to unlock the Send button. */
const CONFIRM_PHRASE = "SEND EMERGENCY";

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

const TEMPLATE_META = {
  outage: { icon: ServerCrash },
  security: { icon: ShieldAlert },
};

function EmergencyBroadcastContent() {
  const { broadcast, isSending, send, clear } = useEmergencyBroadcast();

  const [template, setTemplate] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [etaLocal, setEtaLocal] = useState("");
  const [areas, setAreas] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  /** Prefill the form from a fixed incident preset. */
  const applyTemplate = (key) => {
    const preset = INCIDENT_TEMPLATES[key];
    if (!preset) return;
    setTemplate(key);
    setTitle(preset.title);
    setBody(preset.body);
    setAreas([...preset.defaultAffectedAreas]);
  };

  const toggleArea = (id) => {
    setAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const etaIso = localInputToIso(etaLocal);
  const trimmedTitle = title.trim();
  const canPrepare =
    Boolean(template) && Boolean(trimmedTitle) && areas.length > 0;
  const confirmMatches = confirmText.trim() === CONFIRM_PHRASE;

  const previewAreas = useMemo(() => labelForAreas(areas), [areas]);

  const handleSend = async () => {
    if (!confirmMatches) return;
    try {
      await send({
        template,
        title: trimmedTitle,
        body: body.trim(),
        etaAt: etaIso,
        affectedAreas: areas,
      });
      setConfirmOpen(false);
      setConfirmText("");
    } catch {
      // Hook already surfaced a toast; keep the dialog open to retry.
    }
  };

  const handleResolve = async () => {
    try {
      await clear();
    } catch {
      // Hook already surfaced a toast.
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={Siren}
        title="Emergency broadcast"
        subtitle="Fire a one-click incident alert to every learner. Immediate send — no scheduling."
      />

      {/* Active alert banner (admin view) */}
      {broadcast ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />
            <div>
              <p className={cn(poppins_600.className, "text-sm text-red-700")}>
                Live emergency broadcast: {broadcast.title}
              </p>
              <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                Learners are seeing the red banner now
                {broadcast.affectedAreas?.length
                  ? ` · ${labelForAreas(broadcast.affectedAreas).join(", ")}`
                  : ""}
                .
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResolve}
            disabled={isSending}
            className="rounded-full border-red-500/40 text-red-700 hover:bg-red-500/10"
          >
            <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {isSending ? "Resolving…" : "Mark resolved"}
          </Button>
        </div>
      ) : null}

      {/* Step 1 — pick an incident template */}
      <div className="space-y-3">
        <p className={cn(poppins_600.className, "text-sm text-ink")}>
          1. Choose an incident template
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(INCIDENT_TEMPLATES).map((preset) => {
            const Icon = TEMPLATE_META[preset.id]?.icon || AlertTriangle;
            const selected = template === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyTemplate(preset.id)}
                aria-pressed={selected}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                  selected
                    ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/40"
                    : "border-accent/10 bg-surface-raised hover:border-red-500/40 hover:bg-red-500/5"
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      poppins_600.className,
                      "block text-sm text-ink"
                    )}
                  >
                    {preset.label}
                  </span>
                  <span
                    className={cn(
                      poppins_400.className,
                      "mt-0.5 block text-xs text-ink-muted line-clamp-2"
                    )}
                  >
                    {preset.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — edit + send */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-accent/10 bg-surface-raised p-5 shadow-sm">
          <p className={cn(poppins_600.className, "text-sm text-ink")}>
            2. Review and send
          </p>

          <div className="space-y-1.5">
            <Label
              htmlFor="emergency-title"
              className={cn(poppins_500.className, "text-ink")}
            >
              Title
            </Label>
            <Input
              id="emergency-title"
              placeholder="Platform outage"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              disabled={!template}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="emergency-eta"
              className={cn(
                poppins_500.className,
                "flex items-center gap-1.5 text-ink"
              )}
            >
              <Clock className="h-4 w-4 text-red-600" aria-hidden="true" />
              Estimated resolution ETA (optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="emergency-eta"
                type="datetime-local"
                value={etaLocal}
                onChange={(event) => setEtaLocal(event.target.value)}
                className="max-w-xs"
                disabled={!template}
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
          </div>

          <fieldset className="space-y-2" disabled={!template}>
            <legend
              className={cn(poppins_500.className, "mb-1 text-sm text-ink")}
            >
              Affected areas
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {AFFECTED_AREAS.map((area) => {
                const checkboxId = `emergency-area-${area.id}`;
                return (
                  <div key={area.id} className="flex items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={areas.includes(area.id)}
                      onCheckedChange={() => toggleArea(area.id)}
                    />
                    <Label
                      htmlFor={checkboxId}
                      className={cn(poppins_400.className, "text-sm text-ink")}
                    >
                      {area.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              disabled={!canPrepare || isSending}
              onClick={() => {
                setConfirmText("");
                setConfirmOpen(true);
              }}
              className="rounded-full"
            >
              <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Send emergency broadcast
            </Button>
          </div>
          {!canPrepare ? (
            <p className={cn(poppins_400.className, "text-right text-xs text-ink-muted")}>
              Pick a template, keep a title, and select at least one area.
            </p>
          ) : null}
        </div>

        {/* Learner preview — mirrors the red banner */}
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
              className="rounded-full border-red-500/30 text-xs text-red-600"
            >
              Red alert
            </Badge>
          </p>
          <div className="overflow-hidden rounded-2xl border border-red-800/40 bg-red-600 text-red-50 shadow-md">
            <div className="flex items-start gap-3 px-4 py-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-100"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className={cn(poppins_600.className, "text-sm leading-snug")}>
                  {trimmedTitle || "Your alert title"}
                </p>
                {body.trim() ? (
                  <p className="text-xs leading-snug text-red-100/90">
                    {body.trim()}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                  {etaLocal ? (
                    <span
                      className={cn(
                        poppins_500.className,
                        "inline-flex items-center gap-1 text-xs text-red-100"
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      Est. resolved by{" "}
                      {new Date(etaLocal).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : null}
                  {previewAreas.map((area) => (
                    <span
                      key={area}
                      className={cn(
                        poppins_500.className,
                        "rounded-full border border-red-100/30 bg-red-700/40 px-2 py-0.5 text-[11px] leading-none"
                      )}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
            This is exactly what learners see, app-wide, the moment you send.
          </p>
        </div>
      </div>

      {/* Typed-confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Siren className="h-5 w-5" aria-hidden="true" />
              Send emergency broadcast now?
            </DialogTitle>
            <DialogDescription>
              This sends <strong>immediately</strong> to every learner — there is
              no scheduling and no draft. To confirm, type{" "}
              <span className="font-semibold text-red-600">{CONFIRM_PHRASE}</span>{" "}
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label
              htmlFor="emergency-confirm"
              className={cn(poppins_500.className, "text-ink")}
            >
              Confirmation phrase
            </Label>
            <Input
              id="emergency-confirm"
              autoComplete="off"
              placeholder={CONFIRM_PHRASE}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              disabled={!confirmMatches || isSending}
              onClick={handleSend}
            >
              <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {isSending ? "Sending…" : "Send now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

export default function EmergencyBroadcastPage() {
  return (
    <AdminTierGuard>
      <EmergencyBroadcastContent />
    </AdminTierGuard>
  );
}
