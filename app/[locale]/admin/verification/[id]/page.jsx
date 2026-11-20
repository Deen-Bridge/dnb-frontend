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
import {
  approveVerification,
  fetchDocumentSignedUrl,
  fetchVerificationDetail,
  rejectVerification,
} from "@/lib/actions/admin-verifications";
import DecisionPanel from "./DecisionPanel";

export default function VerificationReviewPage({ params }) {
  const { id } = use(params);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [docIndex, setDocIndex] = useState(0);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVerificationDetail(id)
      .then((res) => !cancelled && setApplication(res.application))
      .catch((e) => !cancelled && setError(e.message || "Failed to load application"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const doc = application?.documents?.[docIndex];

  useEffect(() => {
    let cancelled = false;
    setDocumentPreview(null);
    setDocumentError(null);
    if (!doc?.id) return undefined;
    setDocumentLoading(true);
    fetchDocumentSignedUrl(doc.id)
      .then((result) => {
        if (!cancelled) setDocumentPreview(result);
      })
      .catch((e) => {
        if (!cancelled) setDocumentError(e?.message || "Unable to load a secure document preview.");
      })
      .finally(() => {
        if (!cancelled) setDocumentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doc?.id]);

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
                  <div className="space-y-2" data-testid="document-viewer">
                    {documentLoading && <p className="text-sm text-muted-foreground">Loading secure preview…</p>}
                    {documentError && <p role="alert" className="text-sm text-destructive">Preview unavailable: {documentError}</p>}
                    {documentPreview?.signedUrl && !documentError && (
                      <iframe
                        title={`Secure preview of ${doc.name}`}
                        src={documentPreview.signedUrl}
                        className="h-96 w-full rounded-md border"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {documentPreview?.expiresAt && (
                      <p className="text-xs text-muted-foreground">This authorized preview expires at {new Date(documentPreview.expiresAt).toLocaleString()}.</p>
                    )}
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
                  href={`/educators/${application.userId}`}
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
