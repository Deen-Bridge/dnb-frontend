import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

const csvMock = vi.hoisted(() => ({ downloadCsv: vi.fn() }));
vi.mock("@/lib/utils/csv", () => ({ downloadCsv: csvMock.downloadCsv }));

const serviceMocks = vi.hoisted(() => ({
  fetchGlobalTransactions: vi.fn(),
}));
vi.mock("@/lib/actions/admin-transactions", () => ({
  fetchGlobalTransactions: serviceMocks.fetchGlobalTransactions,
}));

vi.mock("@/lib/config/env", () => ({
  config: {
    stellarNetwork: "testnet",
  },
}));

const MOCK_TRANSACTIONS = [
  {
    _id: "tx_101",
    txHash: "0x8f2d5e1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
    itemType: "course",
    itemTitle: "Tafsir of Surah Al-Fatihah",
    amount: 49.99,
    currency: "USDC",
    status: "confirmed",
    buyer: { name: "Amina Yusuf", email: "amina@deenbridge.org" },
    buyerWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
    creator: { name: "Dr. Bilal Karim", email: "bilal@deenbridge.org" },
    creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
    createdAt: "2026-02-15T10:30:00.000Z",
  },
  {
    _id: "tx_102",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    itemType: "book",
    itemTitle: "The Sealed Nectar",
    amount: 14.50,
    currency: "USDC",
    status: "pending",
    buyer: { name: "Umar Farouk", email: "umar@deenbridge.org" },
    buyerWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
    creator: { name: "Khadija Bello", email: "khadija@deenbridge.org" },
    creatorWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
    createdAt: "2026-02-18T14:15:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.fetchGlobalTransactions.mockResolvedValue({
    success: true,
    transactions: MOCK_TRANSACTIONS,
    pagination: { page: 1, limit: 10, total: 2, pages: 1 },
  });

  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });
  } else {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
  }
});

let GlobalTransactionExplorer;
beforeEach(async () => {
  if (!GlobalTransactionExplorer) {
    const mod = await import("@/components/admin/GlobalTransactionExplorer");
    GlobalTransactionExplorer = mod.default;
  }
});

describe("GlobalTransactionExplorer Component", () => {
  it("renders explorer title and transaction table", async () => {
    render(<GlobalTransactionExplorer />);
    expect(await screen.findByText("Global Transaction Explorer")).toBeInTheDocument();
    expect(screen.getByText("Tafsir of Surah Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("The Sealed Nectar")).toBeInTheDocument();
  });

  it("validates Stellar address input format for buyer and creator wallet search", async () => {
    render(<GlobalTransactionExplorer />);
    await screen.findByText("Global Transaction Explorer");

    const buyerInput = screen.getByLabelText("Search by buyer wallet address");
    fireEvent.change(buyerInput, { target: { value: "invalid_address" } });

    expect(
      screen.getByText("Invalid Stellar address format (must start with G and be 56 characters)")
    ).toBeInTheDocument();

    const applyButton = screen.getByRole("button", { name: "Apply filters" });
    expect(applyButton).toBeDisabled();

    // Fix with valid Stellar address format
    const validAddress = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";
    fireEvent.change(buyerInput, { target: { value: validAddress } });

    expect(
      screen.queryByText("Invalid Stellar address format (must start with G and be 56 characters)")
    ).not.toBeInTheDocument();
    expect(applyButton).not.toBeDisabled();
  });

  it("copies transaction hash to clipboard on clicking copy button", async () => {
    render(<GlobalTransactionExplorer />);
    await screen.findByText("Tafsir of Surah Al-Fatihah");

    const copyBtn = screen.getByLabelText(
      `Copy transaction hash ${MOCK_TRANSACTIONS[0].txHash}`
    );
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(MOCK_TRANSACTIONS[0].txHash);
    expect(toastMock.success).toHaveBeenCalledWith("Transaction hash copied to clipboard!");
  });

  it("renders network-aware Stellar Explorer URLs", async () => {
    render(<GlobalTransactionExplorer />);
    await screen.findByText("Tafsir of Surah Al-Fatihah");

    const link = screen.getByLabelText(
      `View transaction ${MOCK_TRANSACTIONS[0].txHash} on Stellar Explorer (testnet)`
    );
    expect(link).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/tx/${MOCK_TRANSACTIONS[0].txHash}`
    );
  });

  it("triggers CSV export with active filters", async () => {
    render(<GlobalTransactionExplorer />);
    await screen.findByText("Tafsir of Surah Al-Fatihah");

    const exportBtn = screen.getByRole("button", { name: "Export CSV" });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(csvMock.downloadCsv).toHaveBeenCalledTimes(1);
    });

    const args = csvMock.downloadCsv.mock.calls[0][0];
    expect(args.filename).toContain("global-transactions-");
    expect(args.headers).toContain("Transaction Hash / Ref");
    expect(args.headers).toContain("Amount (USDC)");
    expect(args.rows.length).toBe(2);
  });

  it("resets all filters on clicking reset filters button", async () => {
    render(<GlobalTransactionExplorer />);
    await screen.findByText("Tafsir of Surah Al-Fatihah");

    const dateFromInput = screen.getByLabelText("Filter by start date");
    fireEvent.change(dateFromInput, { target: { value: "2026-01-01" } });
    expect(dateFromInput.value).toBe("2026-01-01");

    const resetBtn = screen.getByRole("button", { name: "Reset filters" });
    fireEvent.click(resetBtn);

    expect(dateFromInput.value).toBe("");
  });
});
