import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookPayoutPanel from "@/components/admin/BookPayoutPanel";

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

const explorerMock = vi.hoisted(() => ({
  isValidStellarAddress: vi.fn(),
  getExplorerTransactionUrl: vi.fn(
    (hash) => `https://stellar.expert/explorer/testnet/tx/${hash}`
  ),
  getExplorerUrl: vi.fn(
    (pubkey) => `https://stellar.expert/explorer/testnet/account/${pubkey}`
  ),
}));
vi.mock("@/lib/utils/stellarExplorer", () => explorerMock);

const serviceMocks = vi.hoisted(() => ({
  fetchBookPayouts: vi.fn(),
}));
vi.mock("@/lib/actions/admin-book-payouts", () => ({
  fetchBookPayouts: serviceMocks.fetchBookPayouts,
}));

const BOOK = {
  _id: "bk_002",
  title: "Understanding Hadith Sciences",
  author: { name: "Dr. Fatima" },
  price: 12.99,
};

const WALLET = "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567";

const MOCK_SUMMARY = {
  bookId: "bk_002",
  title: "Understanding Hadith Sciences",
  creatorName: "Dr. Fatima",
  creatorWallet: WALLET,
  unitsSold: 3,
  grossUsdc: 38.97,
  settlements: [
    {
      _id: "pt_201",
      txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
      amount: 12.99,
      currency: "USDC",
      status: "confirmed",
      buyerName: "Amina Yusuf",
      createdAt: "2026-08-05T10:00:00.000Z",
    },
    {
      _id: "pt_202",
      txHash: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c",
      amount: 12.99,
      currency: "USDC",
      status: "confirmed",
      buyerName: "Umar Farouk",
      createdAt: "2026-07-19T14:30:00.000Z",
    },
    {
      _id: "pt_203",
      txHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      amount: 12.99,
      currency: "USDC",
      status: "pending",
      buyerName: "Zaynab Idris",
      createdAt: "2026-07-02T08:15:00.000Z",
    },
    {
      _id: "pt_204",
      txHash: "7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
      amount: 12.99,
      currency: "USDC",
      status: "pending",
      buyerName: "Hassan Ibrahim",
      createdAt: "2026-06-21T09:45:00.000Z",
    },
  ],
};

function renderPanel() {
  return render(
    <BookPayoutPanel book={BOOK} open={true} onOpenChange={vi.fn()} />
  );
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.clearAllMocks();
  explorerMock.isValidStellarAddress.mockReturnValue(true);
  serviceMocks.fetchBookPayouts.mockResolvedValue({
    success: true,
    summary: MOCK_SUMMARY,
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

describe("BookPayoutPanel", () => {
  it("renders the payout summary for a book", async () => {
    renderPanel();

    expect(screen.getByRole("heading", { name: "Author Payouts" })).toBeInTheDocument();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(screen.getByText("Units Sold")).toBeInTheDocument();
    expect(screen.getByText("$38.97")).toBeInTheDocument();
    expect(screen.getByText("Gross USDC")).toBeInTheDocument();

    expect(screen.getByText(WALLET)).toBeInTheDocument();
    expect(screen.getByText("Validated")).toBeInTheDocument();

    const accountLink = screen.getByRole("link", { name: "View on explorer" });
    expect(accountLink).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/account/${WALLET}`
    );

    const txLink = screen.getByRole("link", {
      name: "View settlement transaction on explorer for Amina Yusuf",
    });
    expect(txLink).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/tx/${MOCK_SUMMARY.settlements[0].txHash}`
    );
  });

  it("requests payouts with the book identity", async () => {
    renderPanel();

    await waitFor(() => {
      expect(serviceMocks.fetchBookPayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          bookId: "bk_002",
          bookTitle: "Understanding Hadith Sciences",
          creatorName: "Dr. Fatima",
        })
      );
    });
  });

  it("ignores a stale response from a superseded request", async () => {
    const stale = deferred();
    const fresh = deferred();
    serviceMocks.fetchBookPayouts
      .mockReturnValueOnce(stale.promise)
      .mockReturnValueOnce(fresh.promise);

    const otherBook = {
      _id: "bk_004",
      title: "Tajweed Made Simple",
      author: { name: "Ustadh Ibrahim" },
      price: 5.0,
    };

    const { rerender } = render(
      <BookPayoutPanel book={BOOK} open={true} onOpenChange={vi.fn()} />
    );
    rerender(
      <BookPayoutPanel book={otherBook} open={true} onOpenChange={vi.fn()} />
    );

    fresh.resolve({
      success: true,
      summary: {
        ...MOCK_SUMMARY,
        bookId: "bk_004",
        title: "Tajweed Made Simple",
        creatorName: "Ustadh Ibrahim",
        creatorWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
      },
    });
    expect(
      await screen.findByText("GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0")
    ).toBeInTheDocument();

    stale.resolve({ success: true, summary: MOCK_SUMMARY });
    await waitFor(() => {
      expect(screen.queryByText(WALLET)).not.toBeInTheDocument();
    });
  });

  it("shows an error and recovers on Retry", async () => {
    serviceMocks.fetchBookPayouts
      .mockResolvedValueOnce({ success: false, error: "Server exploded" })
      .mockResolvedValueOnce({ success: true, summary: MOCK_SUMMARY });

    renderPanel();

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("$38.97")).toBeInTheDocument();
    expect(screen.getByText("Validated")).toBeInTheDocument();
  });

  it("flags an unverifiable creator wallet format", async () => {
    explorerMock.isValidStellarAddress.mockReturnValue(false);
    serviceMocks.fetchBookPayouts.mockResolvedValue({
      success: true,
      summary: { ...MOCK_SUMMARY, creatorWallet: "not-an-address" },
    });

    renderPanel();

    expect(await screen.findByText("Unverified format")).toBeInTheDocument();
    expect(screen.getByText("not-an-address")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View on explorer" })).not.toBeInTheDocument();
  });

  it("copies the creator wallet address", async () => {
    renderPanel();

    const copyButton = await screen.findByRole("button", {
      name: "Copy wallet address",
    });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(WALLET);
    });
    expect(toastMock.success).toHaveBeenCalledWith(
      "Creator wallet copied to clipboard!"
    );
  });
});