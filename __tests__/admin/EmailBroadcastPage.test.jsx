/**
 * Email broadcast page — templates, mapping, recipient estimate, send (#302).
 * ---------------------------------------------------------------------------
 * UI-only scope: the page maps composer content onto a selected template,
 * shows an honest recipient estimate ("—" for unknown, never zero), and
 * delegates sending to a backend job. These tests mock the service and assert
 * the presentational branching.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// jsdom does not implement pointer capture, which radix-ui Select relies on.
// Stub the missing methods so the template picker can open.
if (typeof Element !== "undefined" && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const serviceState = vi.hoisted(() => ({
  listTemplates: null,
  estimate: null,
  send: null,
}));
vi.mock("@/lib/actions/admin-emails", async () => {
  const actual = await vi.importActual("@/lib/actions/admin-emails");
  return {
    ...actual,
    listEmailTemplates: () =>
      serviceState.listTemplates
        ? serviceState.listTemplates()
        : Promise.resolve({
            templates: actual.EMAIL_TEMPLATES.map((template) => ({ ...template })),
          }),
    estimateEmailRecipients: (...args) => serviceState.estimate(...args),
    sendEmailBroadcast: (...args) => serviceState.send(...args),
  };
});

import EmailBroadcastPage from "@/app/[locale]/admin/emails/page";

beforeEach(() => {
  serviceState.listTemplates = null;
  serviceState.estimate = () => Promise.resolve({ estimate: 12480, known: true });
  serviceState.send = () =>
    Promise.resolve({
      job: {
        id: "email_test_1",
        status: "queued",
        templateId: "announcement",
        subject: "[Deen Bridge] Seerah launch",
        audience: "everyone",
        estimatedRecipients: 12480,
        createdAt: "2026-08-25T00:00:00.000Z",
      },
    });
});

describe("EmailBroadcastPage", () => {
  it("renders the template picker with all three templates", async () => {
    const user = userEvent.setup();
    render(<EmailBroadcastPage />);

    expect(
      await screen.findByText("Platform news and updates for your audience")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "Maintenance" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Compliance" })).toBeInTheDocument();
  });

  it("maps composer content onto the email subject and body", async () => {
    const user = userEvent.setup();
    render(<EmailBroadcastPage />);

    await screen.findByText("Platform news and updates for your audience");

    await user.type(screen.getByLabelText("Title"), "Seerah launch");
    await user.type(screen.getByLabelText("Content"), "Join the new course.");

    expect(screen.getByText("[Deen Bridge] Seerah launch")).toBeInTheDocument();
    // The typed content appears in the preview body (not just the textarea).
    const bodyMatches = screen.getAllByText(/Join the new course\./);
    expect(
      bodyMatches.some((node) => node.textContent.includes("The Deen Bridge team"))
    ).toBe(true);
  });

  it("shows the estimated recipient count for a known audience", async () => {
    render(<EmailBroadcastPage />);

    expect(await screen.findByText("12,480")).toBeInTheDocument();
    expect(screen.getByText("recipients")).toBeInTheDocument();
  });

  it("shows an honest '—' for an unknown recipient count", async () => {
    const user = userEvent.setup();
    serviceState.estimate = () => Promise.resolve({ estimate: null, known: false });
    render(<EmailBroadcastPage />);

    await screen.findByText("Platform news and updates for your audience");

    await user.click(screen.getByLabelText("Specific Users"));

    expect(await screen.findByText("unknown")).toBeInTheDocument();
    expect(screen.queryByText("12,480")).toBeNull();
  });

  it("delegates sending to the backend and shows the queued job", async () => {
    const user = userEvent.setup();
    render(<EmailBroadcastPage />);

    await screen.findByText("Platform news and updates for your audience");

    await user.type(screen.getByLabelText("Title"), "Seerah launch");
    await user.type(screen.getByLabelText("Content"), "Join the new course.");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(
      await screen.findByText(/queued — job email_test_1 · backend will deliver/i)
    ).toBeInTheDocument();
  });

  it("disables send until there is subject and body content", async () => {
    render(<EmailBroadcastPage />);

    await screen.findByText("Platform news and updates for your audience");

    expect(screen.getByRole("button", { name: /send email/i })).toBeDisabled();
  });
});
