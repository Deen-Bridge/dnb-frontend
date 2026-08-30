import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface EmailTemplate {
  id: string;
  label: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export const EMAIL_TEMPLATES: readonly EmailTemplate[] = Object.freeze([
  {
    id: "announcement",
    label: "Announcement",
    description: "Platform news and updates for your audience",
    subjectTemplate: "[Deen Bridge] {title}",
    bodyTemplate:
      "Hello,\n\n{content}\n\n— The Deen Bridge team",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Scheduled downtime and service notices",
    subjectTemplate: "[Deen Bridge] Scheduled maintenance: {title}",
    bodyTemplate:
      "Hello,\n\n{content}\n\nPlease plan accordingly.\n\n— The Deen Bridge team",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Policy, terms, or data-handling updates",
    subjectTemplate: "[Deen Bridge] Important update: {title}",
    bodyTemplate:
      "Hello,\n\n{content}\n\nYou can review the full policy in your account settings.\n\n— The Deen Bridge team",
  },
]);

export const AUDIENCE_COUNTS: Record<string, number> = Object.freeze({
  everyone: 12480,
  student: 8420,
  educator: 3120,
  admin: 48,
  moderator: 12,
});

export async function listEmailTemplates(): Promise<{ templates: EmailTemplate[] }> {
  return withMockDelay({
    templates: EMAIL_TEMPLATES.map((template) => ({ ...template })),
  });
}

export interface ComposerContent {
  title?: string;
  content?: string;
}

export function applyEmailTemplate(
  template: { subjectTemplate: string; bodyTemplate: string },
  { title = "", content = "" }: ComposerContent = {}
): { subject: string; body: string } {
  const fill = (text: string) =>
    (text || "").replace(/\{title\}/g, title).replace(/\{content\}/g, content);
  return {
    subject: fill(template.subjectTemplate),
    body: fill(template.bodyTemplate),
  };
}

export interface EstimateEmailRecipientsParams {
  audience?: string;
  roles?: string[];
  userIds?: string;
}

export async function estimateEmailRecipients({
  audience = "everyone",
  roles = [],
  userIds = "",
}: EstimateEmailRecipientsParams = {}): Promise<{ estimate: number | null; known: boolean }> {
  if (audience === "everyone") {
    return withMockDelay({ estimate: AUDIENCE_COUNTS.everyone, known: true });
  }

  if (audience === "role") {
    if (!roles.length) return withMockDelay({ estimate: null, known: false });
    const estimate = roles.reduce(
      (total, role) => total + (AUDIENCE_COUNTS[role] || 0),
      0
    );
    return withMockDelay({ estimate, known: true });
  }

  const ids = userIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!ids.length) return withMockDelay({ estimate: null, known: false });
  return withMockDelay({ estimate: ids.length, known: true });
}

export interface SendEmailBroadcastParams {
  templateId?: string;
  subject?: string;
  body?: string;
  audience?: string;
  roles?: string[];
  userIds?: string;
  estimatedRecipients?: number | null;
}

export interface SendEmailBroadcastResult {
  job: {
    id: string;
    status: string;
    templateId: string;
    subject: string;
    audience: string;
    estimatedRecipients: number | null;
    createdAt: string;
  };
}

export async function sendEmailBroadcast({
  templateId = "",
  subject = "",
  body = "",
  audience = "all",
  roles = [],
  userIds = "",
  estimatedRecipients = null,
}: SendEmailBroadcastParams = {}): Promise<SendEmailBroadcastResult> {
  const job = {
    id: `email_${Math.random().toString(36).slice(2, 10)}`,
    status: "queued",
    templateId,
    subject,
    audience,
    estimatedRecipients,
    createdAt: new Date().toISOString(),
  };
  const result = await withMockDelay({ job });

  logAuditEvent({
    action: AUDIT_ACTIONS.BROADCAST,
    target: { label: subject || "Email broadcast", href: null },
    metadata: {
      templateId,
      audience,
      estimatedRecipients,
      hasBody: Boolean(body),
    },
  });

  return result;
}
