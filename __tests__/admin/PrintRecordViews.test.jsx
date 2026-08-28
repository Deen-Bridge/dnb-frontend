import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

const getUserByIdMock = vi.hoisted(() => vi.fn());
const fetchVerificationHistoryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/actions/users/getUserById", () => ({ getUserById: getUserByIdMock }));
vi.mock("@/lib/actions/admin-verification-history", () => ({
  fetchEducatorVerificationHistory: fetchVerificationHistoryMock,
}));

const educatorUser = {
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
};

const defaultHistory = {
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
};

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("Print-Friendly Views for Records (#338)", () => {
  let originalPrint;

  beforeEach(() => {
    vi.clearAllMocks();
    getUserByIdMock.mockResolvedValue({ user: educatorUser });
    fetchVerificationHistoryMock.mockResolvedValue(defaultHistory);
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

    await act(async () => {
      render(
        <TransactionDrawer transaction={sampleTx} open={true} onOpenChange={vi.fn()} />
      );
    });

    // Verify print-root container (Radix Dialog portals to document.body)
    const printRoot = document.body.querySelector(".print-root");
    expect(printRoot).toBeInTheDocument();

    // Verify Print Record button and window.print trigger
    const printBtn = screen.getByRole("button", { name: "Print record" });
    expect(printBtn).toBeInTheDocument();
    expect(printBtn.closest(".no-print")).not.toBeNull();

    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("AdminUserDetailPage renders user record inside print-root with print-url links", async () => {
    const params = Promise.resolve({ userId: "usr_999" });
    await act(async () => {
      render(<AdminUserDetailPage params={params} />);
    });

    expect(await screen.findByRole("heading", { name: "Zaynab Idris" })).toBeInTheDocument();
    expect(await screen.findByText("Verification History")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getAllByText(/Actor:/)).toHaveLength(2);
    expect(screen.getByText(/Backend history endpoint is not available yet/i)).toBeInTheDocument();

    const printRoot = document.body.querySelector(".print-root");
    expect(printRoot).toBeInTheDocument();

    const printBtn = screen.getByRole("button", { name: "Print record" });
    expect(printBtn).toBeInTheDocument();
    expect(printBtn.closest(".no-print")).not.toBeNull();

    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("keeps the latest educator history when an earlier request resolves last", async () => {
    const userAHistory = deferred();
    const userBHistory = deferred();
    getUserByIdMock.mockImplementation(async (userId) => ({
      user: { ...educatorUser, _id: userId, name: userId === "usr_a" ? "Educator A" : "Educator B" },
    }));
    fetchVerificationHistoryMock.mockImplementation((userId) =>
      userId === "usr_a" ? userAHistory.promise : userBHistory.promise
    );

    let rerender;
    await act(async () => {
      ({ rerender } = render(
        <AdminUserDetailPage params={Promise.resolve({ userId: "usr_a" })} />
      ));
    });
    await waitFor(() => expect(fetchVerificationHistoryMock).toHaveBeenCalledWith("usr_a", expect.any(Object)));

    await act(async () => {
      rerender(<AdminUserDetailPage params={Promise.resolve({ userId: "usr_b" })} />);
    });
    await waitFor(() => expect(fetchVerificationHistoryMock).toHaveBeenCalledWith("usr_b", expect.any(Object)));

    await act(async () => {
      userBHistory.resolve({
        source: "backend",
        events: [{ ...defaultHistory.events[0], id: "user-b", actor: "Reviewer B" }],
      });
    });
    expect(await screen.findByText("Reviewer B")).toBeInTheDocument();

    await act(async () => {
      userAHistory.resolve({
        source: "backend",
        events: [{ ...defaultHistory.events[0], id: "user-a", actor: "Reviewer A" }],
      });
    });
    await waitFor(() => expect(screen.queryByText("Reviewer A")).not.toBeInTheDocument());
    expect(screen.getByText("Reviewer B")).toBeInTheDocument();
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
