import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock dependencies
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const stellarContextMock = vi.hoisted(() => ({
  connectedWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
  signTransaction: vi.fn().mockResolvedValue("AAAA_SIGNED_XDR"),
  refreshBalance: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/components/stellar/StellarProvider", () => ({
  useStellar: () => stellarContextMock,
}));

const authMock = vi.hoisted(() => ({
  user: { _id: "user_123", email: "student@deenbridge.org" },
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

const sentryMock = vi.hoisted(() => ({
  captureException: vi.fn(),
  withScope: vi.fn((cb) => cb({ setTag: vi.fn() })),
}));
vi.mock("@sentry/nextjs", () => ({
  default: sentryMock,
  captureException: sentryMock.captureException,
  withScope: sentryMock.withScope,
}));

import useStellarPayment from "@/hooks/useStellarPayment";

const MOCK_PAYMENT_INIT_DATA = {
  success: true,
  transactionId: "tx_mock_123",
  item: { _id: "course_456", title: "Islamic Finance 101", price: 29.99 },
  creator: { name: "Shaykh Ahmad", wallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0" },
  payment: {
    xdr: "AAAA_UNSIGNED_XDR",
    networkPassphrase: "Test SDF Network ; September 2015",
    sep7Uri: "web+stellar:tx?xdr=AAAA_UNSIGNED_XDR",
  },
};

describe("useStellarPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarContextMock.connectedWallet = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";
    stellarContextMock.signTransaction.mockResolvedValue("AAAA_SIGNED_XDR");
    stellarContextMock.refreshBalance.mockResolvedValue(undefined);
    authMock.user = { _id: "user_123" };
    authMock.refreshUser.mockResolvedValue(undefined);
  });

  describe("initializePayment", () => {
    it("rejects initialization if no wallet is connected", async () => {
      stellarContextMock.connectedWallet = null;
      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.initializePayment({ itemType: "course", itemId: "course_1" });
      });

      expect(res).toBeNull();
      expect(toastMock.error).toHaveBeenCalledWith("Please connect your wallet first");
      expect(axiosMock.post).not.toHaveBeenCalled();
    });

    it("initializes payment happy path", async () => {
      axiosMock.post.mockResolvedValue({ data: MOCK_PAYMENT_INIT_DATA });
      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.initializePayment({ itemType: "course", itemId: "course_456" });
      });

      expect(axiosMock.post).toHaveBeenCalledWith("/api/stellar/payment/initialize", {
        itemType: "course",
        itemId: "course_456",
        buyerWallet: stellarContextMock.connectedWallet,
      });
      expect(res).toEqual(MOCK_PAYMENT_INIT_DATA);
      expect(result.current.currentTransaction).toEqual(MOCK_PAYMENT_INIT_DATA);
    });

    it("handles backend error with mapped Stellar error details", async () => {
      axiosMock.post.mockRejectedValue(new Error("op_no_trust"));
      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.initializePayment({ itemType: "course", itemId: "course_456" });
      });

      expect(res).toBeNull();
      expect(toastMock.error).toHaveBeenCalledWith(
        "Your wallet doesn't have a USDC trustline set up.",
        expect.objectContaining({
          description: "Open your wallet and add the USDC asset before making payments.",
        })
      );
    });
  });

  describe("executePayment", () => {
    it("returns error if paymentData is missing", async () => {
      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.executePayment(null);
      });

      expect(res).toEqual({ success: false });
      expect(toastMock.error).toHaveBeenCalledWith("No payment data available");
    });

    it("executes payment happy path: signs XDR, submits, and updates state", async () => {
      axiosMock.post.mockResolvedValue({
        data: {
          success: true,
          transaction: {
            hash: "0xabcdef123456",
            explorerUrl: "https://stellar.expert/explorer/testnet/tx/0xabcdef123456",
          },
        },
      });

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.executePayment(MOCK_PAYMENT_INIT_DATA);
      });

      expect(stellarContextMock.signTransaction).toHaveBeenCalledWith(
        MOCK_PAYMENT_INIT_DATA.payment.xdr,
        MOCK_PAYMENT_INIT_DATA.payment.networkPassphrase
      );
      expect(axiosMock.post).toHaveBeenCalledWith("/api/stellar/payment/submit", {
        transactionId: MOCK_PAYMENT_INIT_DATA.transactionId,
        signedXdr: "AAAA_SIGNED_XDR",
      });
      expect(toastMock.success).toHaveBeenCalledWith("Payment successful!");
      expect(authMock.refreshUser).toHaveBeenCalledWith("user_123");
      expect(stellarContextMock.refreshBalance).toHaveBeenCalled();
      expect(result.current.currentTransaction).toBeNull();
      expect(res.success).toBe(true);
    });

    it("handles user rejection cleanly during signing", async () => {
      const rejectionError = new Error("User declined transaction");
      rejectionError.code = "USER_REJECTED";
      stellarContextMock.signTransaction.mockRejectedValue(rejectionError);

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.executePayment(MOCK_PAYMENT_INIT_DATA);
      });

      expect(res).toBe(false);
      expect(axiosMock.post).not.toHaveBeenCalled();
      expect(toastMock.info).toHaveBeenCalledWith(
        "Transaction cancelled",
        expect.objectContaining({
          description: "You declined the signing request. No changes were made.",
        })
      );
    });

    it("handles Horizon submission failure, logs to Sentry, and shows mapped error", async () => {
      axiosMock.post.mockRejectedValue(new Error("op_underfunded"));

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.executePayment(MOCK_PAYMENT_INIT_DATA);
      });

      expect(res).toEqual({ success: false, cancelled: false });
      expect(sentryMock.captureException).toHaveBeenCalled();
      expect(toastMock.error).toHaveBeenCalledWith(
        "Insufficient Balance",
        expect.objectContaining({
          description: "Add more USDC to your wallet and try again.",
        })
      );
    });

    it("handles unmapped submission failure message", async () => {
      axiosMock.post.mockRejectedValue(new Error("Network connection dropped"));

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.executePayment(MOCK_PAYMENT_INIT_DATA);
      });

      expect(res).toEqual({ success: false, cancelled: false });
      expect(toastMock.error).toHaveBeenCalledWith("Payment failed: Network connection dropped");
    });
  });

  describe("cancelPayment", () => {
    it("calls cancel endpoint and resets currentTransaction", async () => {
      axiosMock.post.mockResolvedValue({ data: MOCK_PAYMENT_INIT_DATA });
      axiosMock.delete.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useStellarPayment());

      await act(async () => {
        await result.current.initializePayment({ itemType: "course", itemId: "course_456" });
      });
      expect(result.current.currentTransaction).not.toBeNull();

      await act(async () => {
        await result.current.cancelPayment();
      });

      expect(axiosMock.delete).toHaveBeenCalledWith(
        `/api/stellar/payment/transactions/${MOCK_PAYMENT_INIT_DATA.transactionId}`
      );
      expect(result.current.currentTransaction).toBeNull();
    });
  });

  describe("getTransactionHistory & getTransaction", () => {
    it("fetches transaction history with role and pagination params", async () => {
      axiosMock.get.mockResolvedValue({
        data: {
          success: true,
          transactions: [{ _id: "tx_1" }],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      });

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.getTransactionHistory({ role: "buyer", page: 1, limit: 10 });
      });

      expect(axiosMock.get).toHaveBeenCalledWith("/api/stellar/payment/transactions", {
        params: { role: "buyer", page: 1, limit: 10 },
      });
      expect(res.success).toBe(true);
      expect(res.transactions).toHaveLength(1);
    });

    it("handles error in getTransactionHistory gracefully", async () => {
      axiosMock.get.mockRejectedValue(new Error("500 Server Error"));

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.getTransactionHistory();
      });

      expect(res.success).toBe(false);
      expect(res.transactions).toEqual([]);
    });

    it("fetches single transaction by id", async () => {
      axiosMock.get.mockResolvedValue({
        data: { success: true, transaction: { _id: "tx_123" } },
      });

      const { result } = renderHook(() => useStellarPayment());

      let res;
      await act(async () => {
        res = await result.current.getTransaction("tx_123");
      });

      expect(axiosMock.get).toHaveBeenCalledWith("/api/stellar/payment/transactions/tx_123");
      expect(res.transaction._id).toBe("tx_123");
    });
  });
});
