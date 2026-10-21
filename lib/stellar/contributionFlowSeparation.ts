export type ContributionFlowKind = "sadaqah_donation" | "scholarship_contribution";

export interface ContributionFlowSpec {
  kind: ContributionFlowKind;
  scholarshipId?: string;
  scholarshipTitle?: string;
  milestoneRuleSummary?: string;
}

export interface ContributionFlowPresentation {
  kind: ContributionFlowKind;
  heading: string;
  confirmationCopy: string;
  receiptCategoryLabel: string;
  scholarshipId: string | null;
  requiresWalletReady: true;
}

export function buildContributionFlowPresentation(
  spec: ContributionFlowSpec
): ContributionFlowPresentation {
  if (spec.kind === "scholarship_contribution") {
    if (!spec.scholarshipId || !spec.scholarshipTitle) {
      throw new Error(
        "Scholarship contributions must specify scholarshipId and scholarshipTitle"
      );
    }
    return {
      kind: "scholarship_contribution",
      heading: `Scholarship Contribution: ${spec.scholarshipTitle}`,
      confirmationCopy: `Milestone-funded support for ${spec.scholarshipTitle} (${spec.milestoneRuleSummary ?? "escrow milestone release rules apply"}).`,
      receiptCategoryLabel: "Named Scholarship Escrow Contribution",
      scholarshipId: spec.scholarshipId,
      requiresWalletReady: true,
    };
  }

  return {
    kind: "sadaqah_donation",
    heading: "Direct Sadaqah Donation",
    confirmationCopy:
      "Unrestricted charitable Sadaqah contribution transferred directly to the verified Sadaqah pool.",
    receiptCategoryLabel: "Direct Sadaqah Charity Donation",
    scholarshipId: null,
    requiresWalletReady: true,
  };
}

export function filterContributionHistory<T extends { kind: ContributionFlowKind }>(
  records: readonly T[],
  filter: ContributionFlowKind | "all"
): T[] {
  if (filter === "all") return [...records];
  return records.filter((r) => r.kind === filter);
}
