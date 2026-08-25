/**
 * Admin learning-engagement analytics service — contract tests (#322).
 * ------------------------------------------------------------------
 * The service in `lib/actions/admin-learning-analytics.js` is the seam the
 * admin learning-analytics page calls for the engagement snapshot. These tests
 * pin the resolved shape the UI depends on and, crucially, that metrics without
 * backend instrumentation resolve with `tracked: false` so the page renders a
 * "not tracked yet" placeholder instead of a silent zero.
 */
import { describe, it, expect } from "vitest";
import { fetchEngagementAnalytics } from "@/lib/actions/admin-learning-analytics";

const FUNNEL_STAGES = ["enrolled", "started", "quarter", "completed"];

describe("fetchEngagementAnalytics", () => {
  it("resolves a snapshot with the documented shape", async () => {
    const data = await fetchEngagementAnalytics();
    expect(typeof data.generatedAt).toBe("string");

    for (const key of ["students", "coursesEnrolled", "lessonsCompleted", "avgSessionLength"]) {
      expect(data.totals[key]).toBeDefined();
      expect(typeof data.totals[key].label).toBe("string");
      expect(typeof data.totals[key].value).toBe("number");
      expect(typeof data.totals[key].tracked).toBe("boolean");
    }
  });

  it("exposes all four funnel stages in learner-progression order", async () => {
    const data = await fetchEngagementAnalytics();
    expect(data.funnel.map((stage) => stage.stage)).toEqual(FUNNEL_STAGES);
    for (const stage of data.funnel) {
      expect(typeof stage.label).toBe("string");
      expect(typeof stage.value).toBe("number");
      expect(typeof stage.tracked).toBe("boolean");
    }
  });

  it("marks the enrolled stage as tracked and later stages as not tracked", async () => {
    const data = await fetchEngagementAnalytics();
    expect(data.funnel.find((s) => s.stage === "enrolled").tracked).toBe(true);
    for (const stage of ["started", "quarter", "completed"]) {
      expect(data.funnel.find((s) => s.stage === stage).tracked).toBe(false);
    }
  });

  it("flags non-instrumented metrics as not tracked", async () => {
    const data = await fetchEngagementAnalytics();
    expect(data.sessionLength.tracked).toBe(false);
    expect(data.lessonsCompleted.tracked).toBe(false);
    expect(data.readingDepth.tracked).toBe(false);
  });

  it("provides distribution bucket shapes for lessons and reading depth", async () => {
    const data = await fetchEngagementAnalytics();
    expect(Array.isArray(data.lessonsCompleted.buckets)).toBe(true);
    expect(data.lessonsCompleted.buckets.length).toBeGreaterThan(0);
    expect(Array.isArray(data.readingDepth.buckets)).toBe(true);
    expect(data.readingDepth.buckets.length).toBeGreaterThan(0);
    for (const bucket of [...data.lessonsCompleted.buckets, ...data.readingDepth.buckets]) {
      expect(typeof bucket.range).toBe("string");
      expect(typeof bucket.value).toBe("number");
    }
  });
});
