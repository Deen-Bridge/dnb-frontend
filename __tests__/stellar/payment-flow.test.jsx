import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const stellarMock = vi.hoisted(() => ({
  connectedWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
  walletInfo: { usdcBalance: "100.00", hasTrustline: true },
  connectWallet: vi.fn(),
  network: "testnet",
  isConnecting: false,
  hasWalletExtension: true,
  networkMismatch: false,
  validateForPayment: vi.fn().mockResolvedValue([]),
}));

const paymentMock = vi.hoisted(() => ({
  initializePayment: vi.fn(),
  executePayment: vi.fn(),
  cancelPayment: vi.fn(),
  isProcessing: false,
}));

vi.mock("@/components/stellar/StellarProvider", () => ({
  useStellar: () => stellarMock,
}));

vi.mock("@/hooks/useStellarPayment", () => ({
  default: () => paymentMock,
  useStellarPayment: () => paymentMock,
}));

vi.mock("@/components/stellar/Sep7QrCode", () => ({
  default: () => <div data-testid="sep7-qr" />,
}));

import PaymentModal from "@/components/stellar/PaymentModal";

const item = { _id: "book-42", title: "Stellar Basics", price: 12 };
const paymentData = {
  transactionId: "tx-42",
  item: { price: 12 },
  creator: { name: "Author", wallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0" },
  payment: { xdr: "unsigned-xdr", networkPassphrase: "Test SDF Network ; September 2015" },
};

describe("Stellar payment flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarMock.validateForPayment.mockResolvedValue([]);
    paymentMock.initializePayment.mockResolvedValue(paymentData);
    paymentMock.executePayment.mockResolvedValue({
      success: true,
      transaction: { hash: "tx-hash", explorerUrl: "https://stellar.expert/tx/tx-hash" },
    });
  });

  it("initiates a payment, asks for confirmation, then shows success", async () => {
    const onSuccess = vi.fn();
    render(
      <PaymentModal
        isOpen
        onClose={vi.fn()}
        item={item}
        itemType="book"
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findByText("Please confirm the transaction in your wallet extension.")).toBeInTheDocument();
    expect(paymentMock.initializePayment).toHaveBeenCalledWith({ itemType: "book", itemId: item._id });

    fireEvent.click(screen.getByRole("button", { name: /sign & pay/i }));

    expect(await screen.findByText("Payment Successful!")).toBeInTheDocument();
    expect(paymentMock.executePayment).toHaveBeenCalledWith(paymentData);
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(screen.getByRole("link", { name: /view on stellar explorer/i })).toHaveAttribute(
      "href",
      "https://stellar.expert/tx/tx-hash"
    );
  });

  it("shows a recoverable failure when transaction execution returns false", async () => {
    paymentMock.executePayment.mockResolvedValue(false);
    render(<PaymentModal isOpen onClose={vi.fn()} item={item} itemType="book" />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByRole("button", { name: /sign & pay/i });
    fireEvent.click(screen.getByRole("button", { name: /sign & pay/i }));

    expect(await screen.findByText("Payment Failed")).toBeInTheDocument();
    expect(screen.getByText("Transaction failed. Please try again.")).toBeInTheDocument();
    expect(paymentMock.executePayment).toHaveBeenCalledWith(paymentData);
  });
});
