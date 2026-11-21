export type PaymentState =
  | "idle"
  | "signing"
  | "submitted"
  | "pending"
  | "confirmed"
  | "failed"
  | "cancelled";

const TERMINAL = new Set<PaymentState>(["confirmed", "failed", "cancelled"]);

export function paymentStateFromServer(value: unknown): PaymentState {
  switch (String(value ?? "").toLowerCase()) {
    case "confirmed":
    case "success": return "confirmed";
    case "failed":
    case "rejected":
    case "expired": return "failed";
    case "submitted": return "submitted";
    case "pending": return "pending";
    case "cancelled":
    case "canceled": return "cancelled";
    default: return "pending";
  }
}

export function isTerminalPaymentState(state: PaymentState): boolean {
  return TERMINAL.has(state);
}
