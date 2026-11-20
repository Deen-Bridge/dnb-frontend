import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminVerificationQueuePage from "@/app/[locale]/admin/verification/page";
import * as svc from "@/lib/actions/admin-verifications";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/actions/admin-verifications", async (orig) => ({
  ...(await orig()),
  fetchVerificationQueue: vi.fn(),
  approveVerification: vi.fn(),
  rejectVerification: vi.fn(),
}));

const app = (id, name, status = "pending") => ({
  id,
  name,
  email: `${id}@example.com`,
  submittedAt: new Date().toISOString(),
  status,
  subjects: ["Fiqh"],
  documents: [{ id: "d1" }],
});

describe("AdminVerificationQueuePage (wired)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders loading then API data, excluding decided items", async () => {
    svc.fetchVerificationQueue.mockResolvedValue({
      applications: [app("a1", "Amina"), app("a2", "Done", "approved")],
    });
    render(<AdminVerificationQueuePage />);
    expect(screen.getByText(/Loading verification queue/)).toBeTruthy();
    expect(await screen.findByText("Amina")).toBeTruthy();
    expect(screen.queryByText("Done")).toBeNull();
  });

  it("shows empty state", async () => {
    svc.fetchVerificationQueue.mockResolvedValue({ applications: [] });
    render(<AdminVerificationQueuePage />);
    expect(await screen.findByText(/No verification applications/)).toBeTruthy();
  });

  it("shows error state", async () => {
    svc.fetchVerificationQueue.mockRejectedValue(new Error("boom"));
    render(<AdminVerificationQueuePage />);
    expect((await screen.findByRole("alert")).textContent).toContain("boom");
  });

  it("approves and rejects via the service and removes the row", async () => {
    svc.fetchVerificationQueue.mockResolvedValue({
      applications: [app("a1", "Amina"), app("a2", "Bilal")],
    });
    svc.approveVerification.mockResolvedValue({});
    svc.rejectVerification.mockResolvedValue({});
    render(<AdminVerificationQueuePage />);
    await screen.findByText("Amina");

    fireEvent.click(screen.getAllByText("Approve")[0]);
    await waitFor(() => expect(svc.approveVerification).toHaveBeenCalledWith("a1"));
    await waitFor(() => expect(screen.queryByText("Amina")).toBeNull());

    fireEvent.change(screen.getByLabelText(/Rejection reason for Bilal/), {
      target: { value: "other" },
    });
    fireEvent.click(screen.getByText("Reject"));
    await waitFor(() =>
      expect(svc.rejectVerification).toHaveBeenCalledWith("a2", { reasonCategory: "other" })
    );
  });
});
