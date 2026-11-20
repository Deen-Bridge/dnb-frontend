import { describe, expect, it } from "vitest";
import {
  MAX_SUPPORT_ATTACHMENT_BYTES,
  isTicketStatus,
  ticketResponse,
  validateTicketInput,
} from "@/lib/support/ticketContract";

describe("support ticket contract", () => {
  it("accepts bounded ticket content and normalizes whitespace", () => {
    expect(validateTicketInput({ subject: "  Login  ", description: "  Cannot sign in " })).toMatchObject({
      ok: true,
      subject: "Login",
      description: "Cannot sign in",
    });
  });

  it("rejects unsupported or oversized attachments before forwarding", () => {
    const file = new File([new Uint8Array(MAX_SUPPORT_ATTACHMENT_BYTES + 1)], "dump.exe", { type: "application/octet-stream" });
    expect(validateTicketInput({ subject: "Issue", description: "Details", file })).toMatchObject({ ok: false });
  });

  it("only accepts server-defined status values and durable ids", () => {
    expect(isTicketStatus("in_progress")).toBe(true);
    expect(isTicketStatus("done")).toBe(false);
    expect(ticketResponse({ ticket: { id: "ST-1", status: "open" } })).toMatchObject({ id: "ST-1", status: "open" });
    expect(ticketResponse({ id: "ST-1", status: "unknown" })).toBeNull();
  });
});
