export type VerifiedMilestoneState =
  "draft" | "funded" | "milestone-pending" | "approved" | "released" | "disputed" | "expired";

export interface ScholarshipMilestoneEventRecord {
  milestoneId: string;
  title: string;
  amountUsdc: string;
  state: VerifiedMilestoneState;
  txHash: string | null;
}

export interface ScholarshipEscrowSnapshot {
  scholarshipId: string;
  beneficiaryAccount: string;
  arbiterAccount: string;
  environment: "mainnet" | "testnet" | "development";
  contractId: string | null;
  expiresAtIso: string;
  lastSyncedAtMs: number;
  milestones: ScholarshipMilestoneEventRecord[];
}

export function presentScholarshipEscrowMilestones(
  snapshot: ScholarshipEscrowSnapshot | null,
  nowMs: number = Date.now(),
  maxStaleMs: number = 300_000
) {
  if (!snapshot) {
    return {
      available: false as const,
      stale: true,
      deploymentBadge: "Unavailable — Escrow state not loaded",
      milestones: [],
    };
  }

  const isDevelopment = snapshot.environment === "development" || !snapshot.contractId;
  const deploymentBadge = isDevelopment
    ? "Development Preview (Not Deployed On-Chain)"
    : snapshot.environment === "mainnet"
      ? "Verified Stellar Mainnet Escrow"
      : "Verified Stellar Testnet Escrow";

  const stale = nowMs - snapshot.lastSyncedAtMs > maxStaleMs;

  return {
    available: true as const,
    stale,
    deploymentBadge,
    isDevelopment,
    beneficiaryAccount: snapshot.beneficiaryAccount,
    arbiterAccount: snapshot.arbiterAccount,
    expiresAtIso: snapshot.expiresAtIso,
    milestones: snapshot.milestones.map((m) => ({
      ...m,
      hasOnChainProof: !isDevelopment && Boolean(m.txHash),
    })),
  };
}
