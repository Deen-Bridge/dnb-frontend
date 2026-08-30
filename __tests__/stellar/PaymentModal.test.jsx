import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// Mock dependencies
const stellarContextMock = vi.hoisted(() => ({
  connectedWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
  walletInfo: {
    publicKey: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
    usdcBalance: "150.00",
    xlmBalance: "25.00",
    hasTrustline: true,
  },
  connectWallet: vi.fn(),
  network: "testnet",
  isConnecting: false,
  hasWalletExtension: true,
  networkMismatch: false,
  validateForPayment: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/stellar/StellarProvider", () => ({
  useStellar: () => stellarContextMock,
}));

const stellarPaymentMock = vi.hoisted(() => ({
  initializePayment: vi.fn(),
  executePayment: vi.fn(),
  cancelPayment: vi.fn(),
  isProcessing: false,
}));

vi.mock("@/hooks/useStellarPayment", () => ({
  default: () => stellarPaymentMock,
  useStellarPayment: () => stellarPaymentMock,
}));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: () => <div data-testid="mock-qrcode" />,
}));

import PaymentModal from "@/components/stellar/PaymentModal";

const MOCK_ITEM = {
  _id: "course_101",
  title: "Advanced Fiqh of Modern Transactions",
  price: 45,
};

const MOCK_PAYMENT_DATA = {
  transactionId: "tx_abc_123",
  item: { price: 45 },
  creator: {
    name: "Ustadh Zaid",
    wallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
  },
  sep7Uri: "web+stellar:tx?xdr=AAAA_SEP7_URI",
  payment: {
    xdr: "AAAA_RAW_XDR",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
};

describe("PaymentModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarContextMock.connectedWallet = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";
    stellarContextMock.walletInfo = {
      publicKey: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
      usdcBalance: "150.00",
      xlmBalance: "25.00",
      hasTrustline: true,
    };
    stellarContextMock.isConnecting = false;
    stellarContextMock.hasWalletExtension = true;
    stellarContextMock.networkMismatch = false;
    stellarContextMock.validateForPayment.mockResolvedValue([]);

    stellarPaymentMock.isProcessing = false;
    stellarPaymentMock.initializePayment.mockResolvedValue(MOCK_PAYMENT_DATA);
    stellarPaymentMock.executePayment.mockResolvedValue({
      success: true,
      transaction: {
        hash: "0x1234567890",
        explorerUrl: "https://stellar.expert/explorer/testnet/tx/0x1234567890",
      },
    });
    stellarPaymentMock.cancelPayment.mockResolvedValue(undefined);
  });

  it("does not render dialog content when isOpen is false", () => {
    render(
      <PaymentModal
        isOpen={false}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );
    expect(screen.queryByText("Purchase Course")).not.toBeInTheDocument();
  });

  it("renders purchase preview with item details and connected wallet info", async () => {
    await act(async () => {
      render(
        <PaymentModal
          isOpen={true}
          onClose={vi.fn()}
          item={MOCK_ITEM}
          itemType="course"
        />
      );
    });

    expect(screen.getByText("Purchase Course")).toBeInTheDocument();
    expect(screen.getByText("Advanced Fiqh of Modern Transactions")).toBeInTheDocument();
    expect(screen.getByText("$45 USDC")).toBeInTheDocument();
    expect(screen.getByText("150.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("testnet")).toBeInTheDocument();

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeEnabled();
  });

  it("shows installation guidance when no wallet extension is detected", async () => {
    stellarContextMock.connectedWallet = null;
    stellarContextMock.hasWalletExtension = false;

    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    expect(screen.getByText("No Stellar wallet detected")).toBeInTheDocument();
    expect(screen.getByText("Install Freighter")).toBeInTheDocument();
    expect(screen.getByText("Install xBull")).toBeInTheDocument();
    expect(screen.getByText("Use Albedo (web wallet)")).toBeInTheDocument();
  });

  it("shows connect wallet button when extension exists but wallet is disconnected", async () => {
    stellarContextMock.connectedWallet = null;
    stellarContextMock.hasWalletExtension = true;

    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="book"
      />
    );

    expect(screen.getByText("Purchase Book")).toBeInTheDocument();
    expect(screen.getByText("Connect your Stellar wallet to continue")).toBeInTheDocument();

    const connectBtns = screen.getAllByRole("button", { name: /connect wallet/i });
    expect(connectBtns.length).toBeGreaterThan(0);
    fireEvent.click(connectBtns[0]);
    expect(stellarContextMock.connectWallet).toHaveBeenCalledTimes(1);
  });

  it("displays wrong network warning and prevents progression when network mismatch occurs", async () => {
    stellarContextMock.networkMismatch = true;

    await act(async () => {
      render(
        <PaymentModal
          isOpen={true}
          onClose={vi.fn()}
          item={MOCK_ITEM}
          itemType="course"
        />
      );
    });

    expect(screen.getByText("Wrong Network")).toBeInTheDocument();
    expect(
      screen.getByText(/Your wallet is on a different network/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
  });

  it("renders pre-check issues (missing trustline / insufficient balance) and disables continue", async () => {
    stellarContextMock.validateForPayment.mockResolvedValue([
      {
        title: "USDC Trustline Missing",
        message: "You need to add a USDC trustline before making payments.",
        nextStep: "Open your wallet and add the USDC asset.",
        type: "trustline",
      },
    ]);

    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("USDC Trustline Missing")).toBeInTheDocument();
      expect(
        screen.getByText("You need to add a USDC trustline before making payments.")
      ).toBeInTheDocument();
      expect(screen.getByText("Fix Issues Above")).toBeDisabled();
    });
  });

  it("disables continue button when wallet balance is lower than item price", async () => {
    stellarContextMock.walletInfo.usdcBalance = "10.00"; // Item price is 45

    await act(async () => {
      render(
        <PaymentModal
          isOpen={true}
          onClose={vi.fn()}
          item={MOCK_ITEM}
          itemType="course"
        />
      );
    });

    const button = screen.getByRole("button", { name: "Insufficient Balance" });
    expect(button).toBeDisabled();
  });

  it("progresses to confirm step after clicking continue", async () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(stellarPaymentMock.initializePayment).toHaveBeenCalledWith({
        itemType: "course",
        itemId: MOCK_ITEM._id,
      });
    });

    expect(
      await screen.findByText("Please confirm the transaction in your wallet extension.")
    ).toBeInTheDocument();
    expect(screen.getByText("Ustadh Zaid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign & pay/i })).toBeInTheDocument();
  });

  it("toggles SEP-7 QR code in confirm step", async () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const qrToggleBtn = await screen.findByRole("button", { name: /pay by qr instead/i });
    fireEvent.click(qrToggleBtn);

    expect(await screen.findByTestId("mock-qrcode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide qr code/i })).toBeInTheDocument();
  });

  it("returns from confirm to preview on clicking Back button", async () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByText("Please confirm the transaction in your wallet extension.");

    const backBtn = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backBtn);

    expect(stellarPaymentMock.cancelPayment).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("handles complete happy path: confirm -> sign & pay -> success state and callback", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <PaymentModal
        isOpen={true}
        onClose={onClose}
        item={MOCK_ITEM}
        itemType="course"
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByRole("button", { name: /sign & pay/i });

    fireEvent.click(screen.getByRole("button", { name: /sign & pay/i }));

    expect(stellarPaymentMock.executePayment).toHaveBeenCalledWith(MOCK_PAYMENT_DATA);

    expect(await screen.findByText("Payment Complete!")).toBeInTheDocument();
    expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    expect(
      screen.getByText(`You now have access to "${MOCK_ITEM.title}"`)
    ).toBeInTheDocument();
    expect(screen.getByText("View on Stellar Explorer")).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/testnet/tx/0x1234567890"
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);

    // Clicking Done closes modal
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("handles payment execution failure state", async () => {
    stellarPaymentMock.executePayment.mockResolvedValue(false);

    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByRole("button", { name: /sign & pay/i });

    fireEvent.click(screen.getByRole("button", { name: /sign & pay/i }));

    expect(await screen.findByText("Payment Failed")).toBeInTheDocument();
    expect(
      screen.getByText("Transaction failed. Please try again.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /close/i }).length).toBeGreaterThan(0);
  });

  it("handles thrown mapped Stellar error during confirm execution", async () => {
    stellarPaymentMock.executePayment.mockRejectedValue(new Error("op_underfunded"));

    render(
      <PaymentModal
        isOpen={true}
        onClose={vi.fn()}
        item={MOCK_ITEM}
        itemType="course"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByRole("button", { name: /sign & pay/i });

    fireEvent.click(screen.getByRole("button", { name: /sign & pay/i }));

    expect(await screen.findByText("Insufficient Balance")).toBeInTheDocument();
    expect(
      screen.getByText("You don't have enough USDC to complete this transaction.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add more USDC to your wallet and try again.")
    ).toBeInTheDocument();
  });

  it("cancels pending transaction on clicking Cancel button in preview", async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(
        <PaymentModal
          isOpen={true}
          onClose={onClose}
          item={MOCK_ITEM}
          itemType="course"
        />
      );
    });

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
