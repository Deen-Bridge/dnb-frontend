import { describe, it, expect } from "vitest";
import {
  buildContributionFlowPresentation,
  filterContributionHistory,
} from "@/lib/stellar/contributionFlowSeparation";

describe("Sadaqah vs scholarship contribution flow separation (#564)", () => {
  it("preserves distinct labels, confirmation copy, and history filtering", () => {
    const sadaqah = buildContributionFlowPresentation({ kind: "sadaqah_donation" });
    expect(sadaqah.receiptCategoryLabel).toBe("Direct Sadaqah Charity Donation");
    expect(sadaqah.scholarshipId).toBeNull();

    const scholarship = buildContributionFlowPresentation({
      kind: "scholarship_contribution",
      scholarshipId: "sch_42",
      scholarshipTitle: "Al-Azhar STEM Fellowship",
    });
    expect(scholarship.receiptCategoryLabel).toBe("Named Scholarship Escrow Contribution");
    expect(scholarship.scholarshipId).toBe("sch_42");

    const filtered = filterContributionHistory(
      [
        { id: 1, kind: "sadaqah_donation" as const },
        { id: 2, kind: "scholarship_contribution" as const },
      ],
      "scholarship_contribution"
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(2);
  });
});
