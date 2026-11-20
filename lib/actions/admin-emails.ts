import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import axiosInstance from "@/lib/config/axios.config";

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

export async function listEmailTemplates(): Promise<{ templates: EmailTemplate[] }> {
  const response = await axiosInstance.get("/api/admin/emails/templates");
  return response.data;
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
  const response = await axiosInstance.post("/api/admin/emails/recipients/estimate", { audience, roles, userIds });
  return response.data;
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
  const response = await axiosInstance.post("/api/admin/emails/broadcasts", {
    templateId, subject, body, audience, roles, userIds, estimatedRecipients,
  });
  const result = response.data as SendEmailBroadcastResult;
  if (!result?.job?.id || result.job.status !== "queued") throw new Error("The server did not confirm email delivery.");

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
