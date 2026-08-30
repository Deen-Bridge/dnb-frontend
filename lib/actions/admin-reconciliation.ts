import { config } from "@/lib/config/env";

const MOCK_DELAY_MS = 400;
const AMOUNT_EPSILON = 0.0000001;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface InternalTransaction {
  id: string;
  reference: string;
  buyer: string;
  creator: string;
  amount: number;
  currency: string;
  completedAt: string;
  txHash: string | null;
}

export interface SettlementClaim {
  txHash: string;
  amount: number;
  currency: string;
  settledAt: string;
}

export type ReconciliationStatus = "matched" | "missing-on-chain" | "amount-mismatch";

export interface ReconciledTransaction extends InternalTransaction {
  status: ReconciliationStatus;
  onChain: SettlementClaim | null;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export async function fetchInternalTransactions({ from, to }: DateRangeParams = {}): Promise<{ transactions: InternalTransaction[] }> {
  void from;
  void to;
  return withMockDelay({
    transactions: [
      {
        id: "txn-1001",
        reference: "PUR-2026-1001",
        buyer: "Amina Yusuf",
        creator: "Ustadh Bilal",
        amount: 25,
        currency: "USDC",
        completedAt: "2026-08-03T09:14:00.000Z",
        txHash: "a1b2c3d4e5f600112233445566778899aabbccddeeff00112233445566778899",
      },
      {
        id: "txn-1002",
        reference: "PUR-2026-1002",
        buyer: "Khalid Rahman",
        creator: "Sr. Maryam",
        amount: 40,
        currency: "USDC",
        completedAt: "2026-08-07T13:40:00.000Z",
        txHash: "bb00cc11dd22ee33ff445566778899aabbccddeeff00112233445566778899aa",
      },
      {
        id: "txn-1003",
        reference: "PUR-2026-1003",
        buyer: "Fatima Noor",
        creator: "Ustadh Bilal",
        amount: 15,
        currency: "USDC",
        completedAt: "2026-08-11T18:05:00.000Z",
        txHash: null,
      },
      {
        id: "txn-1004",
        reference: "PUR-2026-1004",
        buyer: "Yusuf Ali",
        creator: "Sr. Maryam",
        amount: 120,
        currency: "USDC",
        completedAt: "2026-08-15T08:22:00.000Z",
        txHash: "cafe00beef11dead22feed33c0de44ba5e55f00d66ba77c088dd99ee00ff1122",
      },
      {
        id: "txn-1005",
        reference: "PUR-2026-1005",
        buyer: "Zaynab Idris",
        creator: "Ustadh Bilal",
        amount: 60,
        currency: "USDC",
        completedAt: "2026-08-19T21:47:00.000Z",
        txHash: "9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0",
      },
    ],
  });
}

export async function fetchSettlementClaims({ from, to }: DateRangeParams = {}): Promise<{ claims: SettlementClaim[] }> {
  void from;
  void to;
  return withMockDelay({
    claims: [
      {
        txHash: "a1b2c3d4e5f600112233445566778899aabbccddeeff00112233445566778899",
        amount: 25,
        currency: "USDC",
        settledAt: "2026-08-03T09:15:12.000Z",
      },
      {
        txHash: "bb00cc11dd22ee33ff445566778899aabbccddeeff00112233445566778899aa",
        amount: 38.5,
        currency: "USDC",
        settledAt: "2026-08-07T13:41:03.000Z",
      },
      {
        txHash: "9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0",
        amount: 60,
        currency: "USDC",
        settledAt: "2026-08-19T21:48:30.000Z",
      },
    ],
  });
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
      status = "missing-on-chain";
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
