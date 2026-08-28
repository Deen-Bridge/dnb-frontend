/**
 * Admin email broadcast service — templates, recipient estimation, send (#302).
 * ---------------------------------------------------------------------------
 * The UI-only scope delegates actual sending to a backend job. These tests pin
 * the template list, the composer-content → subject/body mapping, the honest
 * recipient estimation (unknown → null, never a fabricated zero), and the
 * queued-job send contract.
 */
import { describe, it, expect } from "vitest";
import {
  listEmailTemplates,
  EMAIL_TEMPLATES,
  AUDIENCE_COUNTS,
  applyEmailTemplate,
  estimateEmailRecipients,
  sendEmailBroadcast,
} from "@/lib/actions/admin-emails";

describe("listEmailTemplates", () => {
  it("exposes the three placeholder templates", async () => {
    const { templates } = await listEmailTemplates();

    expect(templates.map((template) => template.id)).toEqual([
      "announcement",
      "maintenance",
      "compliance",
    ]);
    for (const template of templates) {
      expect(template).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        subjectTemplate: expect.any(String),
        bodyTemplate: expect.any(String),
      });
    }
  });
});

describe("applyEmailTemplate", () => {
  it("maps composer title and content into subject and body", () => {
    const { subject, body } = applyEmailTemplate(EMAIL_TEMPLATES[0], {
      title: "Seerah launch",
      content: "Join the new course.",
    });

    expect(subject).toContain("Seerah launch");
    expect(body).toContain("Join the new course.");
  });

  it("leaves no placeholders when composer content is empty", () => {
    const { subject, body } = applyEmailTemplate(EMAIL_TEMPLATES[1]);

    expect(subject).not.toContain("{title}");
    expect(body).not.toContain("{content}");
  });
});

describe("estimateEmailRecipients", () => {
  it("returns a known estimate for 'everyone'", async () => {
    const result = await estimateEmailRecipients({ audience: "everyone" });

    expect(result.known).toBe(true);
    expect(result.estimate).toBeGreaterThan(0);
  });

  it("returns unknown for role audience with no roles selected", async () => {
    const result = await estimateEmailRecipients({ audience: "role", roles: [] });

    expect(result).toEqual({ estimate: null, known: false });
  });

  it("sums per-role counts for the selected roles", async () => {
    const result = await estimateEmailRecipients({
      audience: "role",
      roles: ["student", "educator"],
    });

    expect(result.known).toBe(true);
    expect(result.estimate).toBe(AUDIENCE_COUNTS.student + AUDIENCE_COUNTS.educator);
  });

  it("returns a count for specific users when IDs are provided", async () => {
    const result = await estimateEmailRecipients({
      audience: "specific",
      userIds: "a@x.com, b@x.com, c@x.com",
    });

    expect(result).toEqual({ estimate: 3, known: true });
  });

  it("returns unknown for specific users with no IDs — honest gap, not zero", async () => {
    const result = await estimateEmailRecipients({ audience: "specific", userIds: "" });

    expect(result).toEqual({ estimate: null, known: false });
  });
});

describe("sendEmailBroadcast", () => {
  it("enqueues a backend job with the mapped content", async () => {
    const { job } = await sendEmailBroadcast({
      templateId: "announcement",
      subject: "[Deen Bridge] Seerah launch",
      body: "Join the new course.",
      audience: "everyone",
      estimatedRecipients: 12480,
    });

    expect(job.status).toBe("queued");
    expect(job.id).toMatch(/^email_/);
    expect(job.templateId).toBe("announcement");
    expect(job.subject).toBe("[Deen Bridge] Seerah launch");
    expect(job.audience).toBe("everyone");
    expect(job.estimatedRecipients).toBe(12480);
  });

  it("keeps an unknown recipient count honest (null, not zero)", async () => {
    const { job } = await sendEmailBroadcast({
      templateId: "compliance",
      subject: "Update",
      audience: "specific",
      estimatedRecipients: null,
    });

    expect(job.estimatedRecipients).toBeNull();
  });
});
