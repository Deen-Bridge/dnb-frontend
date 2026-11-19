"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export default function DisputesPage() {
  return (
    <PageShell>
      <PageHeader
        icon={AlertTriangle}
        title="Disputes queue"
        subtitle="Dispute records and decisions must come from the payment API."
      />
      <Alert>
        <AlertTitle>Disputes are unavailable</AlertTitle>
        <AlertDescription>
          The dispute API contract is not connected in this environment. No
          dispute records, evidence, or resolution actions are shown until
          they can be loaded and persisted by the server.
        </AlertDescription>
      </Alert>
    </PageShell>
  );
}
