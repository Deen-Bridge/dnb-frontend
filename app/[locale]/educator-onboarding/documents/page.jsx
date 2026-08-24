"use client";
/**
 * Educator Onboarding — Document upload step
 * ------------------------------------------
 * The step after the liveness check: the educator uploads their government ID
 * and teaching/school certificate.
 *
 * The wizard's liveness capture routes here on success, and this page hands
 * off to /profile-setup once the required documents are in. It is a distinct
 * route (rather than another slide in the wizard's state machine) so the step
 * is resumable and deep-linkable — the verification status center's
 * "Complete verification" CTA can point straight at it.
 *
 * Only opaque document references live in this page's state. No URL to a
 * stored document is ever produced; viewing one requires a fresh signed URL
 * minted on demand.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import DocumentUpload from "@/components/organisms/educator-onboarding/DocumentUpload";

export default function EducatorDocumentsPage() {
  const router = useRouter();
  const [documentRefs, setDocumentRefs] = useState({});

  const handleComplete = useCallback(() => {
    router.push("/profile-setup");
  }, [router]);

  const handleCancel = useCallback(() => {
    router.push("/educator-onboarding");
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <ShieldCheck className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Step 4 of 4
        </p>
      </div>

      <DocumentUpload
        onChange={setDocumentRefs}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />

      <p className="sr-only" data-testid="document-reference-count">
        {Object.keys(documentRefs).length} documents uploaded
      </p>
    </div>
  );
}
