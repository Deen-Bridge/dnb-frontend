import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const stellarMock = vi.hoisted(() => ({
  connectedWallet: "G_TEST_WALLET",
  signTransaction: vi.fn(),
  refreshBalance: vi.fn(),
  network: "testnet",
}));
vi.mock("@/components/stellar/StellarProvider", () => ({
  useStellar: () => stellarMock,
}));

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));
vi.mock("@/lib/config/axios.config", () => ({ default: axiosMock }));

const sentryMock = vi.hoisted(() => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({ setTag: vi.fn() })),
}));
vi.mock("@sentry/nextjs", () => ({
  default: sentryMock,
  captureException: sentryMock.captureException,
  withScope: sentryMock.withScope,
}));

import useStellarDonation from "@/hooks/useStellarDonation";

describe("useStellarDonation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stellarMock.connectedWallet = "G_TEST_WALLET";
    stellarMock.network = "testnet";
    stellarMock.signTransaction.mockResolvedValue("SIGNED_XDR");
    stellarMock.refreshBalance.mockResolvedValue(undefined);
  });

  it("initializes a donation and stores the returned transaction", async () => {
    const response = {
      success: true,
      donationId: "donation-123",
      transactionXdr: "UNSIGNED_XDR",
    };
    axiosMock.post.mockResolvedValue({ data: response });
    const { result } = renderHook(() => useStellarDonation());

    let donation;
    await act(async () => {
      donation = await result.current.initializeDonation({ amount: 25 });
    });

    expect(axiosMock.post).toHaveBeenCalledWith(
      "/api/stellar/donation/initialize",
      { amount: 25, publicKey: "G_TEST_WALLET" }
    );
    expect(donation).toEqual({ ...response, amount: 25 });
    expect(result.current.currentDonation).toEqual(donation);
    expect(result.current.isProcessing).toBe(false);
  });

  it("returns null and reports an initialization error", async () => {
    axiosMock.post.mockRejectedValue(new Error("service unavailable"));
    const { result } = renderHook(() => useStellarDonation());

    let donation;
    await act(async () => {
      donation = await result.current.initializeDonation({ amount: 10 });
    });

    expect(donation).toBeNull();
    expect(toastMock.error).toHaveBeenCalledWith("service unavailable");
    expect(result.current.isProcessing).toBe(false);
  });

  it("signs and submits a donation, then refreshes the wallet balance", async () => {
    const response = { success: true, txHash: "stellar-tx" };
    axiosMock.post.mockResolvedValueOnce({ data: response });
    axiosMock.post.mockResolvedValueOnce({ data: response });
    const { result } = renderHook(() => useStellarDonation());

    await act(async () => {
      await result.current.initializeDonation({ amount: 25 });
    });
    axiosMock.post.mockResolvedValue({ data: response });

    let submission;
    await act(async () => {
      submission = await result.current.executeDonation({
        donationId: "donation-123",
        transactionXdr: "UNSIGNED_XDR",
      });
    });

    expect(stellarMock.signTransaction).toHaveBeenCalledWith(
      "UNSIGNED_XDR",
      expect.any(String)
    );
    expect(axiosMock.post).toHaveBeenLastCalledWith(
      "/api/stellar/donation/submit",
      { donationId: "donation-123", signedXdr: "SIGNED_XDR" }
    );
    expect(submission).toEqual(response);
    expect(stellarMock.refreshBalance).toHaveBeenCalledOnce();
    expect(toastMock.success).toHaveBeenCalledWith(
      "JazakAllahu khairan! Donation successful!"
    );
    expect(result.current.currentDonation).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });

  it("returns false and reports a failed donation submission", async () => {
    axiosMock.post.mockRejectedValue(new Error("network rejected"));
    const { result } = renderHook(() => useStellarDonation());

    let submission;
    await act(async () => {
      submission = await result.current.executeDonation({
        donationId: "donation-123",
        transactionXdr: "UNSIGNED_XDR",
      });
    });

    expect(submission).toBe(false);
    expect(toastMock.error).toHaveBeenCalledWith(
      "Donation failed: network rejected"
    );
    expect(stellarMock.refreshBalance).not.toHaveBeenCalled();
    expect(result.current.isProcessing).toBe(false);
  });

  it("returns donation statistics from the API", async () => {
    const stats = { success: true, donationCount: 4, totalAmount: 100 };
    axiosMock.get.mockResolvedValue({ data: stats });
    const { result } = renderHook(() => useStellarDonation());

    let receivedStats;
    await act(async () => {
      receivedStats = await result.current.getDonationStats();
    });

    expect(axiosMock.get).toHaveBeenCalledWith("/api/stellar/donation/stats");
    expect(receivedStats).toEqual(stats);
  });
});
