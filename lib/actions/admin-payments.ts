import { withAudit, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface RefundContext {
  amount?: number | null;
  reason?: string | null;
}

export interface RefundPaymentResult {
  refund: {
    orderId: string;
    amount: number | null;
    status: string;
  };
}

export async function refundPayment(orderId: string, context: RefundContext = {}): Promise<RefundPaymentResult> {
  const { amount = null, reason = null } = context;
  return withAudit(
    AUDIT_ACTIONS.REFUND,
    {
      label: `Order ${orderId}`,
      id: orderId,
      href: `/dashboard/admin/payments/${orderId}`,
    },
    () => withMockDelay({ refund: { orderId, amount, status: "refunded" } }),
    { amount, reason }
  );
}
