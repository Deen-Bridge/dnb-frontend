import { describe, expect, it } from "vitest";
import { createPaymentIntent, readPaymentIntent } from "@/lib/stellar/paymentIntent";

describe("payment intent recovery pointer", () => {
  it("rejects another account and expired pointers", () => {
    createPaymentIntent({ userId: "user-a", itemId: "course-a", transactionId: "tx-a", expiresAt: Date.now() + 60000 });
    expect(readPaymentIntent("user-b")).toBeNull();
    createPaymentIntent({ userId: "user-a", itemId: "course-a", transactionId: "tx-old", expiresAt: Date.now() - 1 });
    expect(readPaymentIntent("user-a")).toBeNull();
  });
});
