import { describe, it, expect } from "vitest";
import { presentScholarshipEscrowMilestones } from "@/lib/stellar/scholarshipMilestonePresenter";

describe("presentScholarshipEscrowMilestones (#565)", () => {
  it("clearly labels development-only scholarships and detects stale escrow snapshots", () => {
    const devView = presentScholarshipEscrowMilestones(
      {
        scholarshipId: "sch_1",
        beneficiaryAccount: "GBENEFICIARY",
        arbiterAccount: "GARBITER",
        environment: "development",
        contractId: null,
        expiresAtIso: "2026-12-31T00:00:00Z",
        lastSyncedAtMs: 1_000_000,
        milestones: [
          {
            milestoneId: "m1",
            title: "Semester 1 Tuition",
            amountUsdc: "500.00",
            state: "funded",
            txHash: null,
          },
        ],
      },
      1_500_000,
      300_000
    );

    expect(devView.isDevelopment).toBe(true);
    expect(devView.stale).toBe(true);
    expect(devView.deploymentBadge).toContain("Development Preview");
    expect(devView.milestones[0].hasOnChainProof).toBe(false);
  });
});
