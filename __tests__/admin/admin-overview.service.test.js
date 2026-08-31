/**
 * Admin overview service — empty-database bootstrap snapshot (#339).
 * -------------------------------------------------------------------
 * The overview home page is data-driven: widgets switch to guided hints when a
 * count is zero and the setup checklist derives completion from counts plus
 * settings values. These tests pin the snapshot shape the page depends on.
 */
import { describe, it, expect } from "vitest";
import { fetchAdminOverview } from "@/lib/actions/admin-overview";

describe("fetchAdminOverview", () => {
  it("resolves an empty-database snapshot by default", async () => {
    const snapshot = await fetchAdminOverview();

    expect(snapshot.empty).toBe(true);
    expect(snapshot.generatedAt).toEqual(expect.any(String));
    expect(
      Object.values(snapshot.counts).every((count) => count.value === 0)
    ).toBe(true);
    expect(
      Object.values(snapshot.settings).every(
        (setting) => setting.configured === false
      )
    ).toBe(true);
  });

  it("exposes every count the overview widgets depend on", async () => {
    const snapshot = await fetchAdminOverview();
    const keys = [
      "mentors",
      "categories",
      "courses",
      "books",
      "students",
      "transactions",
    ];

    for (const key of keys) {
      expect(snapshot.counts[key]).toMatchObject({
        label: expect.any(String),
        value: expect.any(Number),
      });
    }
  });

  it("exposes the settings values the checklist is derived from", async () => {
    const snapshot = await fetchAdminOverview();

    expect(snapshot.settings.platformName).toMatchObject({
      label: expect.any(String),
      configured: expect.any(Boolean),
    });
    expect(snapshot.settings.paymentSettings).toMatchObject({
      label: expect.any(String),
      configured: expect.any(Boolean),
    });
  });
});
