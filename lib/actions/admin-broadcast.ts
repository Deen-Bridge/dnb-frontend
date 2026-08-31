import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import { buildBroadcastPushPayload } from "@/lib/actions/push-notifications";

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface SendBroadcastParams {
  title?: string;
  body?: string;
  audience?: string;
  alsoPush?: boolean;
}

export interface BroadcastResult {
  id: string;
  title: string;
  audience: string;
  sentAt: string;
  pushSent: boolean;
}

export async function sendBroadcast({
  title = "",
  body = "",
  audience = "all",
  alsoPush = false,
}: SendBroadcastParams = {}): Promise<{ broadcast: BroadcastResult }> {
  void buildBroadcastPushPayload({ title, body, audience }, { alsoPush });

  const result = await withMockDelay({
    broadcast: {
      id: `bc_${Math.random().toString(36).slice(2, 10)}`,
      title,
      audience,
      sentAt: new Date().toISOString(),
      pushSent: alsoPush,
    },
  });

  logAuditEvent({
    action: AUDIT_ACTIONS.BROADCAST,
    target: { label: title || "Broadcast", href: null },
    metadata: { audience, hasBody: Boolean(body), alsoPush },
  });

  return result;
}
