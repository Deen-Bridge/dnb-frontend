import { describe, expect, it } from "vitest";
import {
  countVerificationSlaBuckets,
  getVerificationAgeDays,
  getVerificationSlaBucket,
} from "@/lib/admin/verification-sla";

const NOW = new Date("2026-08-27T12:00:00Z");

describe("verification SLA helpers", () => {
  it("calculates elapsed full days from submission time", () => {
    expect(getVerificationAgeDays("2026-08-27T08:00:00Z", NOW)).toBe(0);
    expect(getVerificationAgeDays("2026-08-24T11:59:00Z", NOW)).toBe(3);
  });

  it("assigns SLA buckets using the configured thresholds", () => {
    expect(getVerificationSlaBucket("2026-08-25T12:00:00Z", NOW).key).toBe("healthy");
    expect(getVerificationSlaBucket("2026-08-24T12:00:00Z", NOW).key).toBe("watch");
    expect(getVerificationSlaBucket("2026-08-19T12:00:00Z", NOW).key).toBe("overdue");
  });

  it("summarizes queue counts per SLA bucket", () => {
    const queue = [
      { submittedAt: "2026-08-27T12:00:00Z" },
      { submittedAt: "2026-08-24T12:00:00Z" },
      { submittedAt: "2026-08-18T12:00:00Z" },
    ];

    expect(countVerificationSlaBuckets(queue, NOW)).toEqual({
      healthy: 1,
      watch: 1,
      overdue: 1,
    });
  });
});
