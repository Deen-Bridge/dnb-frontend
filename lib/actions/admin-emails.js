/**
 * Admin email broadcast service — templates, recipient estimation, send (#302).
 * ---------------------------------------------------------------------------
 * **STUBBED.** UI-only scope: actual sending is delegated to a backend job.
 * This module mocks the three expected endpoints so the admin email broadcast
 * UI can be built and reviewed before the backend lands. Swap the mock bodies
 * for `axiosInstance` calls (see `lib/config/axios.config.js`).
 *
 * Proposed backend endpoints:
 *   GET  /api/admin/emails/templates    → { templates: EmailTemplate[] }
 *   POST /api/admin/emails/estimate     → { estimate: number|null, known: boolean }
 *   POST /api/admin/emails              → 202 { job: {...} } — enqueues the email
 *                                          job; sending happens server-side
 *
 * Email template shape:
 *   {
 *     id: string,               // "announcement" | "maintenance" | "compliance"
 *     label: string,
 *     description: string,
 *     subjectTemplate: string,  // supports {title} and {content} placeholders
 *     bodyTemplate: string,     // supports {title} and {content} placeholders
 *   }
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Placeholder templates surfaced in the admin template picker. */
export const EMAIL_TEMPLATES = Object.freeze([
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

/** Audience size estimates for the "everyone" and per-role estimates. */
export const AUDIENCE_COUNTS = Object.freeze({
  everyone: 12480,
  student: 8420,
  educator: 3120,
  admin: 48,
  moderator: 12,
});

/**
 * List the email templates available in the picker.
 *
 * TODO(backend): GET /api/admin/emails/templates
 *   - Auth: admin session (server-side tier check).
 *   - 200 → { templates: EmailTemplate[] }
 *
 * @returns {Promise<{ templates: Array<{ id: string, label: string, description: string, subjectTemplate: string, bodyTemplate: string }> }>}
 */
export async function listEmailTemplates() {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/emails/templates")
  //     .then((res) => res.data);
  return withMockDelay({
    templates: EMAIL_TEMPLATES.map((template) => ({ ...template })),
  });
}

/**
 * Map composer content (title + content) onto an email template's placeholders.
 * Pure and synchronous so the preview can recompute live as the admin types.
 *
 * @param {{ subjectTemplate: string, bodyTemplate: string }} template
 * @param {{ title?: string, content?: string }} [composer]
 * @returns {{ subject: string, body: string }}
 */
export function applyEmailTemplate(template, { title = "", content = "" } = {}) {
  const fill = (text) =>
    (text || "").replace(/\{title\}/g, title).replace(/\{content\}/g, content);
  return {
    subject: fill(template.subjectTemplate),
    body: fill(template.bodyTemplate),
  };
}

/**
 * Estimate how many recipients an audience segment reaches. Unknown segments
 * resolve with `estimate: null` and `known: false` so the UI can render a
 * honest "—" instead of a fabricated zero.
 *
 * TODO(backend): POST /api/admin/emails/estimate
 *   - Auth: admin session.
 *   - Payload: { audience: string, roles?: string[], userIds?: string }
 *   - 200 → { estimate: number|null, known: boolean }
 *
 * @param {{ audience?: string, roles?: string[], userIds?: string }} [segment]
 * @returns {Promise<{ estimate: number|null, known: boolean }>}
 */
export async function estimateEmailRecipients({
  audience = "everyone",
  roles = [],
  userIds = "",
} = {}) {
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

  // specific users — only a real count when user IDs are supplied
  const ids = userIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!ids.length) return withMockDelay({ estimate: null, known: false });
  return withMockDelay({ estimate: ids.length, known: true });
}

/**
 * Send an email broadcast. The backend enqueues a job and performs the actual
 * delivery — the UI never sends emails itself. Returns the queued job.
 *
 * TODO(backend): POST /api/admin/emails
 *   - Auth: admin session (server-side tier check).
 *   - Payload: { templateId, subject, body, audience, roles, userIds,
 *                estimatedRecipients }
 *   - 202 → { job: { id, status: "queued", templateId, subject, audience,
 *                     estimatedRecipients, createdAt } }
 *
 * @param {{ templateId?: string, subject?: string, body?: string, audience?: string, roles?: string[], userIds?: string, estimatedRecipients?: number|null }} payload
 * @returns {Promise<{ job: { id: string, status: string, templateId: string, subject: string, audience: string, estimatedRecipients: number|null, createdAt: string } }>}
 */
export async function sendEmailBroadcast({
  templateId = "",
  subject = "",
  body = "",
  audience = "all",
  roles = [],
  userIds = "",
  estimatedRecipients = null,
} = {}) {
  // TODO(backend):
  //   const { data } = await axiosInstance.post("/api/admin/emails", {
  //     templateId, subject, body, audience, roles, userIds, estimatedRecipients,
  //   });
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

  // Fire-and-forget audit trail — never awaited, never blocks the caller.
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
