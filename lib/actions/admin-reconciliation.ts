import { config } from "@/lib/config/env";
import axiosInstance from "@/lib/config/axios.config";

const RECONCILIATION_PATH = "/api/stellar/payment/reconciliation/status";
const AMOUNT_EPSILON = 0.0000001;

export interface InternalTransaction {
  id: string;
  reference: string;
  buyer: string;
  creator: string;
  amount: number;
  currency: string;
  completedAt: string;
  txHash: string | null;
  providerStatus?: string | null;
  ledgerStatus?: string | null;
}

export interface SettlementClaim {
  txHash: string;
  amount: number;
  currency: string;
  settledAt: string;
  providerStatus?: string | null;
  ledgerStatus?: string | null;
}

export type ReconciliationStatus =
  | "matched"
  | "missing-on-chain"
  | "amount-mismatch"
  | "pending";

export interface ReconciledTransaction extends InternalTransaction {
  status: ReconciliationStatus;
  onChain: SettlementClaim | null;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface ReconciliationPage {
  page: number;
  pageSize: number;
  total: number | null;
  hasNext: boolean;
}

function normalizeStatusResponse(data: unknown): {
  transactions: InternalTransaction[];
  claims: SettlementClaim[];
  page: ReconciliationPage;
} {
  const body = (data && typeof data === "object" && "data" in data)
    ? (data as { data?: unknown }).data
    : data;
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const transactions = payload.transactions ?? payload.internalTransactions ?? payload.records;
  const claims = payload.claims ?? payload.settlementClaims ?? payload.providerSettlements;
  const page = payload.pagination && typeof payload.pagination === "object"
    ? payload.pagination as Record<string, unknown>
    : payload;
  const pageNumber = Number(page.page) || 1;
  const pageSize = Number(page.pageSize) || 100;
  const total = Number.isFinite(Number(page.total)) ? Number(page.total) : null;
  const hasNext = page.hasNext === true || (total != null && pageNumber * pageSize < total);

  const normalizedTransactions = Array.isArray(transactions)
    ? transactions.map((transaction) => {
        const item = transaction as Record<string, unknown>;
        return {
          ...item,
          providerStatus: item.providerStatus ?? (item.provider as Record<string, unknown> | undefined)?.status,
          ledgerStatus: item.ledgerStatus ?? (item.ledger as Record<string, unknown> | undefined)?.status,
        } as InternalTransaction;
      })
    : [];
  const normalizedClaims = Array.isArray(claims)
    ? claims.map((claim) => {
        const item = claim as Record<string, unknown>;
        return {
          ...item,
          providerStatus: item.providerStatus ?? item.status ?? (item.provider as Record<string, unknown> | undefined)?.status,
          ledgerStatus: item.ledgerStatus ?? (item.ledger as Record<string, unknown> | undefined)?.status,
        } as SettlementClaim;
      })
    : [];

  return {
    transactions: normalizedTransactions,
    claims: normalizedClaims,
    page: { page: pageNumber, pageSize, total, hasNext },
  };
}

export async function fetchReconciliationStatus(params: DateRangeParams = {}) {
  const { data } = await axiosInstance.get(RECONCILIATION_PATH, {
    params: {
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
      page: params.page || 1,
      pageSize: params.pageSize || 100,
    },
  });
  return normalizeStatusResponse(data);
}

export async function fetchInternalTransactions(params: DateRangeParams = {}) {
  const result = await fetchReconciliationStatus(params);
  return { transactions: result.transactions, page: result.page };
}

export async function fetchSettlementClaims(params: DateRangeParams = {}) {
  const result = await fetchReconciliationStatus(params);
  return { claims: result.claims, page: result.page };
}

export function reconcile(
  transactions: InternalTransaction[],
  claims: SettlementClaim[]
): ReconciledTransaction[] {
  const txList = Array.isArray(transactions) ? transactions : [];
  const claimList = Array.isArray(claims) ? claims : [];

  const claimByHash = new Map<string, SettlementClaim>();
  for (const claim of claimList) {
    if (claim && claim.txHash) claimByHash.set(claim.txHash, claim);
  }

  return txList.map((tx) => {
    const claim = tx?.txHash ? claimByHash.get(tx.txHash) || null : null;

    let status: ReconciliationStatus;
    if (!tx?.txHash || !claim) {
      const transactionStatus = String(tx?.providerStatus || tx?.ledgerStatus || "").toLowerCase();
      status = transactionStatus && !["confirmed", "settled", "complete", "completed", "success", "succeeded"].includes(transactionStatus)
        ? "pending"
        : "missing-on-chain";
    } else if (
      (claim.providerStatus != null &&
        !["confirmed", "settled", "complete", "completed", "success", "succeeded"].includes(
          String(claim.providerStatus).toLowerCase()
        )) ||
      (claim.ledgerStatus != null &&
        !["settled", "confirmed", "complete", "completed", "success", "succeeded"].includes(
          String(claim.ledgerStatus).toLowerCase()
        ))
    ) {
      status = "pending";
    } else if (
      Math.abs(Number(tx.amount) - Number(claim.amount)) > AMOUNT_EPSILON ||
      tx.currency !== claim.currency
    ) {
      status = "amount-mismatch";
    } else {
      status = "matched";
    }

    return { ...tx, status, onChain: claim };
  });
}

export function explorerTxUrl(txHash?: string | null): string | null {
  if (!txHash) return null;
  const segment = config.stellarNetwork === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${segment}/tx/${txHash}`;
}
