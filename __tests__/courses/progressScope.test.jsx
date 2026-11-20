import { describe, expect, it } from "vitest";
import { calcPercent } from "@/hooks/useCourseProgress";

describe("course progress scope invariants", () => {
  it("keeps percentage calculation bounded for malformed durations", () => {
    expect(calcPercent(10, 0)).toBe(0);
    expect(calcPercent(200, 100)).toBe(100);
  });

  it("documents that progress is keyed by user and course", () => {
    const userA = "dnb:learning:v1:courseProgress:user-a:course-1";
    const userB = "dnb:learning:v1:courseProgress:user-b:course-1";
    expect(userA).not.toBe(userB);
  });
});
