import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionDrawer from "@/components/admin/TransactionDrawer";
import AdminUserDetailPage from "@/app/[locale]/admin/users/[userId]/page";
import DisputesPage from "@/app/[locale]/admin/payments/disputes/page";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

vi.mock("@/lib/config/env", () => ({
  config: {
    stellarNetwork: "testnet",
  },
}));

vi.mock("@/lib/actions/users/getUserById", () => ({
  getUserById: vi.fn().mockResolvedValue({
    user: {
      _id: "usr_999",
      name: "Zaynab Idris",
      email: "zaynab@deenbridge.org",
      role: "educator",
      status: "active",
      createdAt: "2025-03-01T00:00:00Z",
      walletAddress: "GC3BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q111",
      bio: "Quran & Tajweed Educator",
      verification: {
        submittedAt: "2026-01-01T09:00:00.000Z",
        approvedAt: "2026-01-02T10:00:00.000Z",
        reviewedBy: "Amina Admin",
      },
      purchases: [{ id: "p1", title: "Fiqh of Worship", amount: "42.00", date: "2026-01-01" }],
    },
  }),
}));

vi.mock("@/lib/actions/admin-verification-history", () => ({
  fetchEducatorVerificationHistory: vi.fn().mockResolvedValue({
    source: "composed",
    events: [
      {
        id: "approved-1",
        type: "approved",
        label: "Approved",
        actor: "Amina Admin",
        timestamp: "2026-01-02T10:00:00.000Z",
        note: null,
      },
      {
        id: "submitted-1",
        type: "submitted",
        label: "Submitted",
        actor: "Zaynab Idris",
        timestamp: "2026-01-01T09:00:00.000Z",
        note: null,
      },
    ],
  }),
}));

describe("Print-Friendly Views for Records (#338)", () => {
  let originalPrint;

  beforeEach(() => {
    vi.clearAllMocks();
    originalPrint = window.print;
    window.print = vi.fn();
  });

  afterEach(() => {
    window.print = originalPrint;
  });

  it("TransactionDrawer renders print-root container and triggers window.print()", async () => {
    const sampleTx = {
      _id: "PLT-10099",
      txHash: "0x8f2d5e1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
      amount: 49.99,
      status: "confirmed",
      itemType: "course",
      itemTitle: "Tafsir of Surah Al-Fatihah",
      createdAt: "2026-02-15T10:30:00.000Z",
      buyer: { name: "Amina Yusuf", email: "amina@deenbridge.org" },
      buyerWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
      creator: { name: "Dr. Bilal Karim", email: "bilal@deenbridge.org" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
    };

    const { container } = render(
      <TransactionDrawer transaction={sampleTx} open={true} onOpenChange={vi.fn()} />
    );

    // Verify print-root container
    const printRoot = container.querySelector(".print-root");
    expect(printRoot).toBeInTheDocument();

    // Verify Print Record button and window.print trigger
    const printBtn = screen.getByRole("button", { name: "Print record" });
    expect(printBtn).toBeInTheDocument();
    expect(printBtn.className).toContain("no-print");

    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("AdminUserDetailPage renders user record inside print-root with print-url links", async () => {
    const params = Promise.resolve({ userId: "usr_999" });
    const { container } = render(<AdminUserDetailPage params={params} />);

    expect(await screen.findByText("Zaynab Idris")).toBeInTheDocument();
    expect(await screen.findByText("Verification History")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getAllByText(/Actor:/)).toHaveLength(2);
    expect(screen.getByText(/Backend history endpoint is not available yet/i)).toBeInTheDocument();

    const printRoot = container.querySelector(".print-root");
    expect(printRoot).toBeInTheDocument();

    const printBtn = screen.getByRole("button", { name: "Print record" });
    expect(printBtn).toBeInTheDocument();
    expect(printBtn.className).toContain("no-print");

    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("DisputesPage detail modal renders print-root container and print record button", async () => {
    const { container } = render(<DisputesPage />);

    expect(await screen.findByText("Disputes Queue")).toBeInTheDocument();

    // Click first dispute row to open detail modal
    const row = screen.getByText("Ahmad Patel");
    fireEvent.click(row);

    // Verify detail modal print-root and print record button
    expect(await screen.findByText("Linked Transaction")).toBeInTheDocument();

    const printBtn = screen.getByRole("button", { name: "Print record" });
    expect(printBtn).toBeInTheDocument();
    expect(printBtn.className).toContain("no-print");

    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
