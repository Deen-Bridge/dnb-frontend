"use client";

import { DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

function PaymentsContent() {
  return (
    <PageShell>
      <PageHeader
        icon={DollarSign}
        title="Payment administration"
        subtitle="Authoritative payment data is required for refunds and disputes."
      />
      <Alert>
        <AlertTitle>Payment administration is unavailable</AlertTitle>
        <AlertDescription>
          The payment API contract is not connected in this environment. No
          payment records or refund actions are shown until they can be loaded
          and persisted by the server.
        </AlertDescription>
      </Alert>
    </PageShell>
  );
}

export default function PaymentsPage() {
  return (
    <AdminTierGuard>
      <PaymentsContent />
    </AdminTierGuard>
  );
}
