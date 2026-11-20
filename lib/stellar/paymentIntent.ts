import axiosInstance from "@/lib/config/axios.config";

export type PaymentStatus = "pending" | "confirmed" | "failed" | "expired" | "unknown";
export type PaymentIntentPointer = { version: 1; transactionId: string; userId: string; itemId: string; expiresAt: number };
export type PaymentIntent = PaymentIntentPointer & { status: PaymentStatus };
const KEY_PREFIX = "dnb:payment-intent:v1:";
const storageKey = (userId: string) => `${KEY_PREFIX}${encodeURIComponent(userId)}`;

export function createPaymentIntent(pointer: Omit<PaymentIntentPointer, "version">): PaymentIntentPointer {
  if (!pointer.userId || !pointer.transactionId || !pointer.itemId || !Number.isFinite(pointer.expiresAt)) throw new Error("A server transaction, user, item, and expiry are required");
  const value: PaymentIntentPointer = { version: 1, ...pointer };
  sessionStorage.setItem(storageKey(pointer.userId), JSON.stringify(value));
  return value;
}

export function readPaymentIntent(userId: string): PaymentIntentPointer | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey(userId)) || "null");
    if (!value || value.version !== 1 || value.userId !== userId || !value.transactionId || !value.itemId || value.expiresAt <= Date.now()) { clearPaymentIntent(userId); return null; }
    return value;
  } catch { clearPaymentIntent(userId); return null; }
}

export async function recoverPaymentIntent(userId: string): Promise<PaymentIntent | null> {
  const pointer = readPaymentIntent(userId);
  if (!pointer) return null;
  try {
    const { data } = await axiosInstance.get(`/api/payments/intents/${encodeURIComponent(pointer.transactionId)}`);
    const status: PaymentStatus = ["pending", "confirmed", "failed", "expired"].includes(data?.status) ? data.status : "unknown";
    if (["confirmed", "failed", "expired"].includes(status)) clearPaymentIntent(userId);
    return { ...pointer, status };
  } catch { return { ...pointer, status: "unknown" }; }
}

export function clearPaymentIntent(userId: string): void { sessionStorage.removeItem(storageKey(userId)); }
