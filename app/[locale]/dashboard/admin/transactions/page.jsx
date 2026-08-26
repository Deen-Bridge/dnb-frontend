"use client";

import { PageShell } from "@/components/ui/page-shell";
import GlobalTransactionExplorer from "@/components/admin/GlobalTransactionExplorer";

export default function DashboardAdminTransactionsPage() {
  return (
    <PageShell>
      <GlobalTransactionExplorer />
    </PageShell>
  );
}
