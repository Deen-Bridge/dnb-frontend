import { describe, expect, it } from "vitest";
import { reconcileEvents } from "@/lib/realtime/event-reconciler";
import { isTerminalPaymentState, paymentStateFromServer } from "@/lib/stellar/payment-state";

describe("runtime safety contracts", () => {
  it("orders events and drops duplicate or stale deliveries", () => {
    const result = reconcileEvents([
      { id: "b", sequence: 2, payload: "second" },
      { id: "a", sequence: 1, payload: "first" },
      { id: "b", sequence: 2, payload: "duplicate" },
      { id: "old", sequence: 1, payload: "stale" },
    ], 0);
    expect(result.accepted.map((event) => event.id)).toEqual(["a", "b"]);
    expect(result.lastSequence).toBe(2);
  });

  it("does not treat submission as settlement", () => {
    expect(paymentStateFromServer("submitted")).toBe("submitted");
    expect(paymentStateFromServer("confirmed")).toBe("confirmed");
    expect(isTerminalPaymentState("submitted")).toBe(false);
    expect(isTerminalPaymentState("confirmed")).toBe(true);
  });
});
