import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const authMock = vi.hoisted(() => ({
  user: { _id: "user_123", email: "user@example.com" },
  refreshUser: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/hooks/useAuth", () => ({
  default: () => authMock,
  useAuth: () => authMock,
}));

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/lib/config/axios.config", () => ({
  default: axiosMock,
}));

const walletsKitMock = vi.hoisted(() => ({
  init: vi.fn(),
  authModal: vi.fn(),
  disconnect: vi.fn(),
  signTransaction: vi.fn(),
}));

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: walletsKitMock,
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
    PUBLIC: "Public Global Stellar Network ; September 2015",
  },
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/freighter", () => ({
  FreighterModule: vi.fn(),
  FREIGHTER_ID: "freighter",
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/xbull", () => ({
  xBullModule: vi.fn(),
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/albedo", () => ({
  AlbedoModule: vi.fn(),
}));

import StellarProvider, { useStellar } from "@/components/stellar/StellarProvider";
import useStellarWallet from "@/hooks/useStellarWallet";

const VALID_PUBLIC_KEY = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";

describe("useStellarWallet & StellarProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.user = { _id: "user_123", email: "user@example.com" };
    authMock.refreshUser = vi.fn().mockResolvedValue(undefined);

    // Default axios responses
    axiosMock.get.mockResolvedValue({
      data: { success: true, connected: false },
    });
    axiosMock.post.mockResolvedValue({
      data: {
        success: true,
        wallet: {
          publicKey: VALID_PUBLIC_KEY,
          usdcBalance: "100.00",
          xlmBalance: "50.00",
          hasTrustline: true,
        },
      },
    });
    axiosMock.delete.mockResolvedValue({
      data: { success: true },
    });

    walletsKitMock.authModal.mockResolvedValue({ address: VALID_PUBLIC_KEY });
    walletsKitMock.signTransaction.mockResolvedValue({ signedTxXdr: "AAAA_SIGNED_XDR" });
  });

  const wrapper = ({ children }) => <StellarProvider>{children}</StellarProvider>;

  it("throws error if useStellar is used outside of StellarProvider", () => {
    expect(() => renderHook(() => useStellar())).toThrow(
      "useStellar must be used within StellarProvider"
    );
  });

  it("initializes StellarWalletsKit with configured modules on mount", async () => {
    const { result } = renderHook(() => useStellarWallet(), { wrapper });

    await waitFor(() => {
      expect(walletsKitMock.init).toHaveBeenCalledTimes(1);
      expect(result.current.kitInitialized).toBe(true);
    });
  });

  it("detects installed window.freighter extension", async () => {
    window.freighter = {
      isConnected: vi.fn().mockResolvedValue(true),
    };

    const { result } = renderHook(() => useStellarWallet(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasWalletExtension).toBe(true);
    });

    delete window.freighter;
  });

  it("fetches stored wallet on mount if user is logged in", async () => {
    axiosMock.get.mockImplementation((url) => {
      if (url === "/api/stellar/wallet/me") {
        return Promise.resolve({
          data: {
            success: true,
            connected: true,
            wallet: {
              publicKey: VALID_PUBLIC_KEY,
              usdcBalance: "50.00",
              hasTrustline: true,
            },
          },
        });
      }
      return Promise.reject(new Error("Unknown route"));
    });

    const { result } = renderHook(() => useStellarWallet(), { wrapper });

    await waitFor(() => {
      expect(axiosMock.get).toHaveBeenCalledWith("/api/stellar/wallet/me");
      expect(result.current.connectedWallet).toBe(VALID_PUBLIC_KEY);
      expect(result.current.walletInfo?.usdcBalance).toBe("50.00");
    });
  });

  describe("connectWallet", () => {
    it("connects wallet successfully and saves to backend", async () => {
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(walletsKitMock.authModal).toHaveBeenCalled();
      expect(axiosMock.post).toHaveBeenCalledWith("/api/stellar/wallet/connect", {
        publicKey: VALID_PUBLIC_KEY,
      });
      expect(result.current.connectedWallet).toBe(VALID_PUBLIC_KEY);
      expect(result.current.walletInfo?.usdcBalance).toBe("100.00");
      expect(authMock.refreshUser).toHaveBeenCalledWith("user_123");
      expect(toastMock.success).toHaveBeenCalledWith("Wallet connected successfully!");
    });

    it("handles unauthenticated user attempting to connect", async () => {
      authMock.user = null;
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(toastMock.error).toHaveBeenCalledWith("Please log in to connect your wallet");
      expect(walletsKitMock.authModal).not.toHaveBeenCalled();
    });

    it("handles no wallet error by showing installation guidance toast", async () => {
      walletsKitMock.authModal.mockRejectedValue(new Error("no wallet installed"));
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(toastMock.error).toHaveBeenCalledWith(
        "No Stellar wallet detected. Install Freighter to continue.",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Install Freighter" }),
        })
      );
    });

    it("silently handles user rejection/cancellation during wallet selection", async () => {
      walletsKitMock.authModal.mockRejectedValue(new Error("User rejected the request"));
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(toastMock.error).not.toHaveBeenCalled();
    });

    it("handles backend connection failure", async () => {
      axiosMock.post.mockResolvedValue({
        data: { success: false, message: "Wallet address already bound to another account" },
      });
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(toastMock.error).toHaveBeenCalledWith("Wallet address already bound to another account");
    });
  });

  describe("disconnectWallet", () => {
    it("disconnects wallet from backend and resets local state", async () => {
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      // First connect
      await act(async () => {
        await result.current.connectWallet();
      });
      expect(result.current.connectedWallet).toBe(VALID_PUBLIC_KEY);

      // Now disconnect
      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(axiosMock.delete).toHaveBeenCalledWith("/api/stellar/wallet/disconnect");
      expect(walletsKitMock.disconnect).toHaveBeenCalled();
      expect(result.current.connectedWallet).toBeNull();
      expect(result.current.walletInfo).toBeNull();
      expect(toastMock.success).toHaveBeenCalledWith("Wallet disconnected");
      expect(authMock.refreshUser).toHaveBeenCalledWith("user_123");
    });

    it("handles backend disconnect failure", async () => {
      axiosMock.delete.mockRejectedValue(new Error("Network Error"));
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(toastMock.error).toHaveBeenCalledWith("Failed to disconnect wallet");
    });
  });

  describe("selectWallet", () => {
    it("returns public key address without saving to backend", async () => {
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      let address;
      await act(async () => {
        address = await result.current.selectWallet();
      });

      expect(address).toBe(VALID_PUBLIC_KEY);
      expect(axiosMock.post).not.toHaveBeenCalled();
    });

    it("throws error if auth modal fails to return address", async () => {
      walletsKitMock.authModal.mockResolvedValue({});
      const { result } = renderHook(() => useStellarWallet(), { wrapper });

      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await expect(result.current.selectWallet()).rejects.toThrow("Failed to get wallet address");
    });
  });

  describe("refreshBalance", () => {
    it("fetches updated balance for connected wallet", async () => {
      axiosMock.get.mockImplementation((url) => {
        if (url.includes("/balance/")) {
          return Promise.resolve({
            data: {
              success: true,
              usdcBalance: "250.00",
              xlmBalance: "75.00",
            },
          });
        }
        return Promise.resolve({ data: { success: true } });
      });

      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      // Connect
      await act(async () => {
        await result.current.connectWallet();
      });

      // Refresh balance
      await act(async () => {
        await result.current.refreshBalance();
      });

      expect(axiosMock.get).toHaveBeenCalledWith(
        `/api/stellar/wallet/balance/${VALID_PUBLIC_KEY}`
      );
      expect(result.current.walletInfo?.usdcBalance).toBe("250.00");
    });
  });

  describe("signTransaction", () => {
    it("signs transaction XDR and returns signed XDR string", async () => {
      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      let signed;
      await act(async () => {
        signed = await result.current.signTransaction("RAW_XDR", "Test SDF Network");
      });

      expect(walletsKitMock.signTransaction).toHaveBeenCalledWith("RAW_XDR", {
        networkPassphrase: "Test SDF Network",
      });
      expect(signed).toBe("AAAA_SIGNED_XDR");
    });

    it("maps user cancellation to structured USER_REJECTED error", async () => {
      walletsKitMock.signTransaction.mockRejectedValue(new Error("User declined the transaction"));
      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await expect(result.current.signTransaction("RAW_XDR")).rejects.toMatchObject({
        code: "USER_REJECTED",
        title: "Transaction Cancelled",
      });
    });

    it("rethrows unmapped signing errors", async () => {
      walletsKitMock.signTransaction.mockRejectedValue(new Error("Hardware wallet timed out"));
      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await expect(result.current.signTransaction("RAW_XDR")).rejects.toThrow(
        "Hardware wallet timed out"
      );
    });
  });

  describe("validateForPayment", () => {
    it("reports missing wallet issue when not connected", async () => {
      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      const issues = await result.current.validateForPayment(25);
      expect(issues.some((i) => i.type === "no_wallet")).toBe(true);
    });

    it("reports missing trustline issue when wallet has no USDC trustline", async () => {
      axiosMock.post.mockResolvedValue({
        data: {
          success: true,
          wallet: {
            publicKey: VALID_PUBLIC_KEY,
            usdcBalance: "100.00",
            hasTrustline: false,
          },
        },
      });

      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      const issues = await result.current.validateForPayment(25);
      expect(issues.some((i) => i.type === "trustline")).toBe(true);
    });

    it("reports insufficient balance issue when USDC balance is lower than item price", async () => {
      axiosMock.post.mockResolvedValue({
        data: {
          success: true,
          wallet: {
            publicKey: VALID_PUBLIC_KEY,
            usdcBalance: "15.00",
            hasTrustline: true,
          },
        },
      });

      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      const issues = await result.current.validateForPayment(50);
      expect(issues.some((i) => i.type === "balance")).toBe(true);
    });

    it("returns no issues when all conditions are satisfied", async () => {
      axiosMock.post.mockResolvedValue({
        data: {
          success: true,
          wallet: {
            publicKey: VALID_PUBLIC_KEY,
            usdcBalance: "100.00",
            hasTrustline: true,
          },
        },
      });

      const { result } = renderHook(() => useStellarWallet(), { wrapper });
      await waitFor(() => expect(result.current.kitInitialized).toBe(true));

      await act(async () => {
        await result.current.connectWallet();
      });

      const issues = await result.current.validateForPayment(50);
      expect(issues).toEqual([]);
    });
  });

  describe("Stellar Public Key Validation", () => {
    it("validates standard 56-character Stellar public keys starting with G", () => {
      const isValidKey = (key) => typeof key === "string" && /^G[A-Z2-7]{55}$/.test(key);

      expect(isValidKey(VALID_PUBLIC_KEY)).toBe(true);
      expect(isValidKey("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(true);
      expect(isValidKey("invalid_key")).toBe(false);
      expect(isValidKey("SBC6F2...")).toBe(false); // Secret seed starts with S
      expect(isValidKey("GA5ZSEJY")).toBe(false); // Too short
    });
  });
});
