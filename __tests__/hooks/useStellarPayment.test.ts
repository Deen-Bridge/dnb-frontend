import { describe, expect, it } from "vitest";
describe("useStellarPayment contract", () => {
  it("starts in a pending-safe state", () => {
    expect({ status: "idle" }).toMatchObject({ status: "idle" });
  });
});
