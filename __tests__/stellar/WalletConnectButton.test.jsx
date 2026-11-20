import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock dependencies
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const stellarContextMock = vi.hoisted(() => ({
  connectedWallet: null,
  walletInfo: null,
  isConnecting: false,
  isLoading: false,
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  refreshBalance: vi.fn(),
  network: "testnet",
  hasWalletExtension: true,
  networkMismatch: false,
}));

vi.mock("@/components/stellar/StellarProvider", () => ({
  useStellar: () => stellarContextMock,
}));

import WalletConnectButton from "@/components/stellar/WalletConnectButton";

const TEST_PUBLIC_KEY = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";

describe("WalletConnectButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarContextMock.connectedWallet = null;
    stellarContextMock.walletInfo = null;
    stellarContextMock.isConnecting = false;
    stellarContextMock.isLoading = false;
    stellarContextMock.hasWalletExtension = true;
    stellarContextMock.networkMismatch = false;
    stellarContextMock.network = "testnet";

    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    }
  });

  it("renders loading state when isLoading is true", () => {
    stellarContextMock.isLoading = true;

    render(<WalletConnectButton />);

    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });

  it("renders Install Wallet dropdown when no wallet extension is detected", () => {
    stellarContextMock.connectedWallet = null;
    stellarContextMock.hasWalletExtension = false;

    render(<WalletConnectButton />);

    expect(screen.getByRole("button", { name: /install wallet/i })).toBeInTheDocument();
  });

  it("renders Connect Wallet button when extension is available", () => {
    stellarContextMock.connectedWallet = null;
    stellarContextMock.hasWalletExtension = true;

    render(<WalletConnectButton />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(stellarContextMock.connectWallet).toHaveBeenCalledTimes(1);
  });

  it("renders connecting spinner when isConnecting is true", () => {
    stellarContextMock.connectedWallet = null;
    stellarContextMock.hasWalletExtension = true;
    stellarContextMock.isConnecting = true;

    render(<WalletConnectButton />);

    const button = screen.getByRole("button", { name: /connecting/i });
    expect(button).toBeDisabled();
  });

  it("renders truncated public key when wallet is connected", () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "250.00",
      xlmBalance: "40.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    expect(screen.getByText("GA5ZSE...AOMNEB")).toBeInTheDocument();
  });

  it("displays balances and network badge in dropdown menu", async () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "250.00",
      xlmBalance: "40.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    const trigger = screen.getByRole("button", { name: /GA5ZSE/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown", code: "ArrowDown" });

    expect(await screen.findByText("250.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("40.0000 XLM")).toBeInTheDocument();
  });

  it("copies address to clipboard on clicking copy address", async () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "250.00",
      xlmBalance: "40.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    const trigger = screen.getByRole("button", { name: /GA5ZSE/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown", code: "ArrowDown" });

    const copyItem = await screen.findByText("Copy Address");
    fireEvent.click(copyItem);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TEST_PUBLIC_KEY);
    expect(toastMock.success).toHaveBeenCalledWith("Address copied to clipboard");
  });

  it("refreshes balance on clicking refresh balance", async () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "250.00",
      xlmBalance: "40.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    const trigger = screen.getByRole("button", { name: /GA5ZSE/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown", code: "ArrowDown" });

    const refreshItem = await screen.findByText("Refresh Balance");
    fireEvent.click(refreshItem);

    expect(stellarContextMock.refreshBalance).toHaveBeenCalledTimes(1);
  });

  it("disconnects wallet on clicking disconnect", async () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "250.00",
      xlmBalance: "40.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    const trigger = screen.getByRole("button", { name: /GA5ZSE/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown", code: "ArrowDown" });

    const disconnectItem = await screen.findByText("Disconnect");
    fireEvent.click(disconnectItem);

    expect(stellarContextMock.disconnectWallet).toHaveBeenCalledTimes(1);
  });

  it("displays network mismatch warning indicator and message in dropdown", async () => {
    stellarContextMock.connectedWallet = TEST_PUBLIC_KEY;
    stellarContextMock.networkMismatch = true;
    stellarContextMock.walletInfo = {
      publicKey: TEST_PUBLIC_KEY,
      usdcBalance: "10.00",
      hasTrustline: true,
    };

    render(<WalletConnectButton />);

    const trigger = screen.getByRole("button", { name: /GA5ZSE/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown", code: "ArrowDown" });

    expect(await screen.findByText(/Wrong network. Switch wallet to/i)).toBeInTheDocument();
  });
});
