"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  REJECTION_REASON_CATEGORIES,
  approveVerification,
  fetchVerificationDetail,
  rejectVerification,
} from "@/lib/actions/admin-verifications";

/** Decision controls, rendered in a side column on desktop and a bottom sheet on mobile. */
export function DecisionPanel({ application, busy, onApprove, onReject }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const decided = application.status === "approved" || application.status === "rejected";

  if (decided) {
    return (
      <p className="text-sm" data-testid="decision-final">
        This application was <strong>{application.status}</strong>.
        {application.rejectionReason ? ` Reason: ${application.rejectionReason}` : ""}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={busy} onClick={onApprove}>
        Approve
      </Button>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Reject with reason</legend>
        {REJECTION_REASON_CATEGORIES.map((c) => (
          <label key={c.id} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="reason"
              value={c.id}
              checked={reason === c.id}
              onChange={() => setReason(c.id)}
            />
            <span>{c.label}</span>
          </label>
        ))}
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for the applicant (optional)"
        />
      </fieldset>
      <Button
        variant="destructive"
        className="w-full"
        disabled={busy || !reason}
        onClick={() => onReject({ reasonCategory: reason, notes })}
      >
        Reject
      </Button>
    </div>
  );
}

export default function VerificationReviewPage({ params }) {
  const { id } = use(params);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [docIndex, setDocIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchVerificationDetail(id)
      .then((res) => !cancelled && setApplication(res.application))
      .catch((e) => !cancelled && setError(e.message || "Failed to load application"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const decide = async (fn, label) => {
    setBusy(true);
    try {
      const res = await fn();
      setApplication((a) => ({ ...a, status: res.application.status }));
      toast.success(`Application ${label}.`);
      setSheetOpen(false);
    } catch (e) {
      toast.error(e?.message || `Failed to ${label}.`);
    } finally {
      setBusy(false);
    }
  };

  const ctx = application && { name: application.name, email: application.email };
  const panel = application && (
    <DecisionPanel
      application={application}
      busy={busy}
      onApprove={() => decide(() => approveVerification(application.id, ctx), "approved")}
      onReject={(p) => decide(() => rejectVerification(application.id, p, ctx), "rejected")}
    />
  );

  const doc = application?.documents?.[docIndex];

  return (
    <PageShell>
      <PageHeader
        title="Verification review"
        description="Review the applicant, documents and public profile, then decide."
      />
      <Link
        href="/admin/verification"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to queue
      </Link>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!application && !error && <p className="text-sm text-muted-foreground">Loading...</p>}

      {application && (
        <div className="grid gap-4 pb-24 lg:grid-cols-[1fr_320px] lg:pb-0">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {application.name}
                  <Badge variant="outline">{application.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{application.email} - {application.country}</p>
                <p>Submitted {new Date(application.submittedAt).toLocaleString()}</p>
                <p>{application.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {(application.subjects || []).map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <p>
                  Liveness: {application.livenessScore}%{" "}
                  {application.livenessPassed ? "(passed)" : "(failed)"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Submitted documents</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(application.documents || []).map((d, i) => (
                    <Button
                      key={d.id}
                      size="sm"
                      variant={i === docIndex ? "default" : "outline"}
                      onClick={() => setDocIndex(i)}
                    >
                      <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                      {d.type}
                    </Button>
                  ))}
                </div>
                {doc && (
                  <div
                    className="flex h-72 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground"
                    data-testid="document-viewer"
                  >
                    {/* TODO: render the real file via a signed URL once the backend exposes one */}
                    Preview unavailable (stub): {doc.name}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Public profile preview</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {/* TODO: embed the real public profile once its route is confirmed */}
                <p className="font-medium">{application.name}</p>
                <p className="text-muted-foreground">{application.bio}</p>
                <Link
                  href={`/profile/${application.userId}`}
                  className="inline-flex items-center gap-1 underline"
                >
                  Open public profile <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-4">
              <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
              <CardContent>{panel}</CardContent>
            </Card>
          </aside>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-4 shadow-lg lg:hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between text-sm font-medium"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen((o) => !o)}
            >
              Decision
              <ChevronUp
                className={`h-4 w-4 transition-transform ${sheetOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {sheetOpen && <div className="mt-3 max-h-[60vh] overflow-y-auto">{panel}</div>}
          </div>
        </div>
      )}
    </PageShell>
  );
}
