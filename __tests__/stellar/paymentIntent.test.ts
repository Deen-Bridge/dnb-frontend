import { createPaymentIntent, readPaymentIntent, clearPaymentIntent } from "@/lib/stellar/paymentIntent";

describe("payment intent storage", () => {
  it("isolates an intent by account and keeps it pending until reconciliation", () => {
    const intent = createPaymentIntent("user-1");
    expect(intent.status).toBe("pending");
    expect(readPaymentIntent("user-1")?.id).toBe(intent.id);
    expect(readPaymentIntent("user-2")).toBeNull();
    clearPaymentIntent("user-1");
  });
});
