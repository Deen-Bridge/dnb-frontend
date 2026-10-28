export async function fetchReconciliationStatus(fetcher = fetch) {
  const r = await fetcher("/api/stellar/payment/reconciliation/status", { credentials: "include" });
  if (!r.ok) throw new Error(`Reconciliation status failed (${r.status})`);
  return r.json();
}
