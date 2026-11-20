export type PaymentIntent = {
  id: string;
  ownerId: string | null;
  status: "pending" | "confirmed" | "failed";
  createdAt: number;
};

const KEY_PREFIX = "dnb:v1:payment-intent:";
const TTL_MS = 15 * 60 * 1000;

function keyFor(ownerId: string | null = null): string {
  return `${KEY_PREFIX}${encodeURIComponent(ownerId || "anonymous")}`;
}

export function createPaymentIntent(ownerId: string | null = null): PaymentIntent {
  const intent: PaymentIntent = {
    id: crypto.randomUUID(),
    ownerId,
    status: "pending",
    createdAt: Date.now(),
  };
  sessionStorage.setItem(keyFor(ownerId), JSON.stringify(intent));
  return intent;
}

export function readPaymentIntent(ownerId: string | null = null): PaymentIntent | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(keyFor(ownerId)) || "null") as PaymentIntent | null;
    if (!value || typeof value.id !== "string" || value.ownerId !== ownerId || Date.now() - value.createdAt > TTL_MS) {
      if (value) sessionStorage.removeItem(keyFor(ownerId));
      return null;
    }
    return value;
  } catch {
    sessionStorage.removeItem(keyFor(ownerId));
    return null;
  }
}

export function clearPaymentIntent(ownerId: string | null = null): void {
  sessionStorage.removeItem(keyFor(ownerId));
}
