import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock dependencies
const stellarPaymentMock = vi.hoisted(() => ({
  getTransactionHistory: vi.fn(),
}));

vi.mock("@/hooks/useStellarPayment", () => ({
  default: () => stellarPaymentMock,
  useStellarPayment: () => stellarPaymentMock,
}));

vi.mock("@/components/admin/TransactionDrawer", () => ({
  default: ({ open, transaction }) =>
    open ? <div data-testid="mock-transaction-drawer">{transaction?._id}</div> : null,
}));

import TransactionHistory from "@/components/stellar/TransactionHistory";

const MOCK_TRANSACTIONS = [
  {
    _id: "tx_101",
    itemTitle: "Tafsir Ibn Kathir Course",
    itemType: "course",
    amount: 50,
    status: "confirmed",
    creator: { name: "Shaykh Muhammad" },
    creatorWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
    buyer: { name: "Amina Yusuf" },
    buyerWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
    createdAt: "2026-03-01T12:00:00.000Z",
    explorerUrl: "https://stellar.expert/explorer/testnet/tx/0x101",
  },
  {
    _id: "tx_102",
    itemTitle: "Introduction to Hadith Studies",
    itemType: "book",
    amount: 15,
    status: "pending",
    creator: { name: "Dr. Bilal" },
    creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
    buyer: { name: "Umar Farouk" },
    buyerWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
    createdAt: "2026-03-02T14:30:00.000Z",
  },
];

describe("TransactionHistory Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarPaymentMock.getTransactionHistory.mockResolvedValue({
      success: true,
      transactions: MOCK_TRANSACTIONS,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      },
    });
  });

  it("renders transaction table with items, amounts, and statuses", async () => {
    render(<TransactionHistory />);

    expect(screen.getByText("Transaction History")).toBeInTheDocument();

    expect(await screen.findByText("Tafsir Ibn Kathir Course")).toBeInTheDocument();
    expect(screen.getByText("Introduction to Hadith Studies")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$15")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders empty state when transaction list is empty", async () => {
    stellarPaymentMock.getTransactionHistory.mockResolvedValue({
      success: true,
      transactions: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });

    render(<TransactionHistory />);

    expect(await screen.findByText("No transactions found")).toBeInTheDocument();
    expect(screen.getByText("You haven't made any purchases yet")).toBeInTheDocument();
  });

  it("renders error state and retries on clicking Try Again", async () => {
    stellarPaymentMock.getTransactionHistory.mockResolvedValueOnce({
      success: false,
      error: "Network timeout",
    });

    render(<TransactionHistory />);

    expect(await screen.findByText("Failed to load transactions")).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();

    stellarPaymentMock.getTransactionHistory.mockResolvedValueOnce({
      success: true,
      transactions: MOCK_TRANSACTIONS,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText("Tafsir Ibn Kathir Course")).toBeInTheDocument();
  });

  it("switches role filter and requests transactions for creator", async () => {
    render(<TransactionHistory />);
    await screen.findByText("Tafsir Ibn Kathir Course");

    const roleTrigger = screen.getByLabelText("View transactions as");
    fireEvent.pointerDown(roleTrigger, { button: 0, ctrlKey: false });
    fireEvent.click(roleTrigger);

    const creatorOption = await screen.findByRole("option", { name: "As Creator" });
    fireEvent.click(creatorOption);

    await waitFor(() => {
      expect(stellarPaymentMock.getTransactionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ role: "creator", page: 1 })
      );
    });
  });

  it("navigates pagination when multiple pages exist", async () => {
    stellarPaymentMock.getTransactionHistory.mockResolvedValue({
      success: true,
      transactions: MOCK_TRANSACTIONS,
      pagination: {
        page: 1,
        limit: 10,
        total: 20,
        pages: 2,
      },
    });

    render(<TransactionHistory />);
    await screen.findByText("Tafsir Ibn Kathir Course");

    expect(screen.getByText("Page 1 of 2 (20 transactions)")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(stellarPaymentMock.getTransactionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("opens transaction drawer when clicking a transaction row or eye icon", async () => {
    render(<TransactionHistory />);
    await screen.findByText("Tafsir Ibn Kathir Course");

    const eyeButtons = screen.getAllByLabelText("View transaction drawer record");
    fireEvent.click(eyeButtons[0]);

    expect(await screen.findByTestId("mock-transaction-drawer")).toBeInTheDocument();
    expect(screen.getByText("tx_101")).toBeInTheDocument();
  });
});
