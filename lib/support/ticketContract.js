export const SUPPORT_TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

export const MAX_SUPPORT_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const SUPPORT_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

export function validateTicketInput({ subject, description, file }) {
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  const cleanDescription =
    typeof description === "string" ? description.trim() : "";

  if (!cleanSubject || cleanSubject.length > 160) {
    return { ok: false, error: "Subject is required and must be 160 characters or fewer." };
  }
  if (!cleanDescription || cleanDescription.length > 10_000) {
    return { ok: false, error: "Description is required and must be 10,000 characters or fewer." };
  }
  if (file && (!(file instanceof File) || file.size > MAX_SUPPORT_ATTACHMENT_BYTES)) {
    return { ok: false, error: "Attachments must be 10 MB or smaller." };
  }
  if (file && !SUPPORT_ATTACHMENT_TYPES.has(file.type)) {
    return { ok: false, error: "This attachment type is not supported." };
  }

  return { ok: true, subject: cleanSubject, description: cleanDescription };
}

export function isTicketStatus(value) {
  return SUPPORT_TICKET_STATUSES.includes(value);
}

export function ticketResponse(data) {
  const ticket = data?.ticket ?? data;
  if (!ticket?.id || !isTicketStatus(ticket.status)) return null;
  return {
    id: String(ticket.id),
    status: ticket.status,
    createdAt: ticket.createdAt ?? null,
    updatedAt: ticket.updatedAt ?? null,
  };
}
