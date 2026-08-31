import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAxios = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/config/axios.config", () => ({
  default: mockAxios,
}));

import {
  composeVerificationHistoryFromUser,
  fetchEducatorVerificationHistory,
} from "@/lib/actions/admin-verification-history";

describe("admin verification history service", () => {
  beforeEach(() => {
    mockAxios.get.mockReset();
  });

  it("uses backend verification events when the endpoint is available", async () => {
    mockAxios.get.mockResolvedValue({
      data: {
        events: [
          {
            id: "evt_1",
            type: "approved",
            actor: { name: "Admin reviewer" },
            timestamp: "2026-01-03T12:00:00.000Z",
          },
        ],
      },
    });

    const result = await fetchEducatorVerificationHistory("usr_1", {});

    expect(mockAxios.get).toHaveBeenCalledWith(
      "/api/admin/educators/usr_1/verification-history"
    );
    expect(result.source).toBe("backend");
    expect(result.events[0]).toMatchObject({
      type: "approved",
      actor: "Admin reviewer",
      label: "Approved",
    });
  });

  it("composes newest-first fallback events from educator record fields", async () => {
    mockAxios.get.mockRejectedValue(new Error("Not found"));

    const result = await fetchEducatorVerificationHistory("usr_2", {
      email: "educator@example.com",
      verification: {
        submittedAt: "2026-01-01T09:00:00.000Z",
        infoRequestedAt: "2026-01-02T09:00:00.000Z",
        approvedAt: "2026-01-03T09:00:00.000Z",
        reviewedBy: "Amina Admin",
        infoRequestReason: "Certificate scan was unclear.",
      },
    });

    expect(result.source).toBe("composed");
    expect(result.events.map((event) => event.type)).toEqual([
      "approved",
      "info_requested",
      "submitted",
    ]);
    expect(result.events[1].note).toBe("Certificate scan was unclear.");
  });

  it("normalizes explicit history arrays from the user record", () => {
    const events = composeVerificationHistoryFromUser({
      verificationHistory: [
        { type: "submitted", timestamp: "2026-01-01T00:00:00Z", actor: "Educator" },
        { type: "re_verified", timestamp: "2026-01-04T00:00:00Z", actor: "Admin" },
      ],
    });

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("re_verified");
    expect(events[0].label).toBe("Re-verified");
  });

  it("does not treat a generic review timestamp as rejection for an approved record", () => {
    const events = composeVerificationHistoryFromUser({
      verification: {
        status: "approved",
        submittedAt: "2026-01-01T00:00:00Z",
        reviewedAt: "2026-01-02T00:00:00Z",
        approvedAt: "2026-01-02T00:00:00Z",
      },
    });

    expect(events.map((event) => event.type)).toEqual(["approved", "submitted"]);
  });
});
