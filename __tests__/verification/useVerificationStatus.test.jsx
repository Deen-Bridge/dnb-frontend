import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null,
  fetchVerificationStatus: vi.fn(),
  refreshUser: vi.fn(),
  onVerificationUpdate: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, refreshUser: mocks.refreshUser }),
}));

vi.mock("@/hooks/useNotificationSSE", () => ({
  useNotificationSSE: () => ({ onVerificationUpdate: mocks.onVerificationUpdate }),
}));

vi.mock("@/lib/actions/educators/fetchVerificationStatus", () => ({
  VERIFICATION_STATUS: {
    NOT_STARTED: "not_started",
    INCOMPLETE: "incomplete",
    PENDING: "pending",
    UNDER_REVIEW: "under_review",
    REJECTED: "rejected",
    VERIFIED: "verified",
  },
  fetchVerificationStatus: mocks.fetchVerificationStatus,
}));

import { useVerificationStatus } from "@/hooks/useVerificationStatus";

const statusResult = (status) => ({
  status,
  lastCompletedStep: 1,
  totalSteps: 3,
  rejectionReason: null,
  submittedAt: null,
  reviewedAt: null,
  documents: [],
  timeline: [],
});

describe("useVerificationStatus role gating and status branches", () => {
  beforeEach(() => {
    mocks.user = null;
    mocks.fetchVerificationStatus.mockReset();
    mocks.refreshUser.mockReset().mockResolvedValue(undefined);
    mocks.onVerificationUpdate.mockReset().mockReturnValue(() => {});
    window.localStorage.clear();
  });

  it("normalizes mentor to educator and exposes the verified branch", async () => {
    mocks.user = { role: "mentor", _id: "mentor-1" };
    mocks.fetchVerificationStatus.mockResolvedValue(statusResult("verified"));

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.fetchVerificationStatus).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("verified");
    expect(result.current.isVerified).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isBannerVisible).toBe(false);
  });

  it("loads the pending, unverified branch for an educator", async () => {
    mocks.user = { role: "educator", _id: "educator-1" };
    mocks.fetchVerificationStatus.mockResolvedValue(statusResult("pending"));

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.fetchVerificationStatus).toHaveBeenCalledOnce();
    expect(result.current.isVerified).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.isBannerVisible).toBe(true);
  });

  it("does not fetch verification status for a student", async () => {
    mocks.user = { role: "student" };

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.fetchVerificationStatus).not.toHaveBeenCalled();
    expect(result.current.status).toBe("not_started");
    expect(result.current.isVerified).toBe(false);
    expect(result.current.isBannerVisible).toBe(false);
  });

  it("exposes an error and fallback state when the status request fails", async () => {
    mocks.user = { role: "educator" };
    mocks.fetchVerificationStatus.mockRejectedValue(new Error("network unavailable"));

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network unavailable");
    expect(result.current.status).toBe("not_started");
    expect(result.current.isVerified).toBe(false);
    expect(result.current.isBannerVisible).toBe(true);
  });

  it("refreshes the status and user record", async () => {
    mocks.user = { role: "educator", _id: "educator-2" };
    mocks.fetchVerificationStatus
      .mockResolvedValueOnce(statusResult("pending"))
      .mockResolvedValueOnce(statusResult("verified"));

    const { result } = renderHook(() => useVerificationStatus());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.refresh());

    expect(mocks.fetchVerificationStatus).toHaveBeenCalledTimes(2);
    expect(mocks.refreshUser).toHaveBeenCalledWith("educator-2");
    expect(result.current.isVerified).toBe(true);
  });
});
