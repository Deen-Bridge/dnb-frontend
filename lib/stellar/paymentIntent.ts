export type PaymentIntent = {
  id: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: number;
};
const KEY = "dnb:payment-intent";
export function createPaymentIntent(): PaymentIntent {
  const intent = { id: crypto.randomUUID(), status: "pending" as const, createdAt: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(intent));
  return intent;
}
export function readPaymentIntent(): PaymentIntent | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || "null");
    return v && typeof v.id === "string" ? v : null;
  } catch {
    return null;
  }
}
export function clearPaymentIntent(): void {
  sessionStorage.removeItem(KEY);
}
