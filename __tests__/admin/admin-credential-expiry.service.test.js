import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import {
  CREDENTIAL_EXPIRY_STATUS,
  computeCredentialExpiry,
  fetchExpiringMentorCredentials,
  matchesCredentialExpiryFilter,
} from "@/lib/actions/admin-credential-expiry";
import { sendReverificationReminder } from "@/lib/services/reverification-reminders";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn() },
}));

describe("mentor credential expiry", () => {
  const now = new Date("2026-04-01T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes expired, expiring, valid, and missing statuses", () => {
    expect(computeCredentialExpiry("2026-03-31", now)).toEqual({
      status: CREDENTIAL_EXPIRY_STATUS.EXPIRED,
      daysRemaining: -1,
    });
    expect(computeCredentialExpiry("2026-05-01", now)).toEqual({
      status: CREDENTIAL_EXPIRY_STATUS.EXPIRING,
      daysRemaining: 30,
    });
    expect(computeCredentialExpiry("2026-08-01", now).status).toBe(
      CREDENTIAL_EXPIRY_STATUS.VALID
    );
    expect(computeCredentialExpiry(null, now)).toEqual({
      status: CREDENTIAL_EXPIRY_STATUS.MISSING,
      daysRemaining: null,
    });
  });

  it("matches future credentials against 30, 60, and 90 day filters", () => {
    const credential = {
      expiryStatus: CREDENTIAL_EXPIRY_STATUS.EXPIRING,
      daysRemaining: 45,
    };
    expect(matchesCredentialExpiryFilter(credential, "30")).toBe(false);
    expect(matchesCredentialExpiryFilter(credential, "60")).toBe(true);
    expect(matchesCredentialExpiryFilter(credential, "90")).toBe(true);
  });

  it("keeps expired credentials out of upcoming windows", () => {
    const credential = {
      expiryStatus: CREDENTIAL_EXPIRY_STATUS.EXPIRED,
      daysRemaining: -2,
    };
    expect(matchesCredentialExpiryFilter(credential, "90")).toBe(false);
    expect(matchesCredentialExpiryFilter(credential, "expired")).toBe(true);
  });

  it("fetches and flattens verified mentor credential records", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        mentors: [
          {
            id: "mentor_1",
            name: "Amina Yusuf",
            email: "amina@example.com",
            verificationStatus: "verified",
            credentials: [
              {
                id: "credential_1",
                type: "Teaching certificate",
                expiresAt: "2026-05-01",
              },
            ],
          },
          {
            id: "mentor_2",
            name: "Unverified Mentor",
            email: "pending@example.com",
            verificationStatus: "pending",
            credentials: [
              {
                id: "credential_2",
                type: "Teaching certificate",
                expiresAt: "2026-05-01",
              },
            ],
          },
        ],
      },
    });

    const result = await fetchExpiringMentorCredentials({ now });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/mentors/credentials",
      { params: {} }
    );
    expect(result.source).toBe("api");
    expect(result.credentials).toHaveLength(1);
    expect(result.credentials[0]).toMatchObject({
      mentorId: "mentor_1",
      credentialId: "credential_1",
      credentialType: "Teaching certificate",
      expiryStatus: CREDENTIAL_EXPIRY_STATUS.EXPIRING,
      daysRemaining: 30,
    });
  });
});

describe("sendReverificationReminder", () => {
  it("returns the notification stub acknowledgement", async () => {
    const result = await sendReverificationReminder({
      mentorId: "mentor_1",
      credentialId: "credential_1",
      credentialType: "Teaching certificate",
      expiresAt: "2026-05-01",
    });

    expect(result.queued).toBe(true);
    expect(result.notificationId).toContain("mentor_1_credential_1");
    expect(Number.isNaN(new Date(result.queuedAt).getTime())).toBe(false);
  });

  it("validates the required reminder identifiers", async () => {
    await expect(
      sendReverificationReminder({
        mentorId: "",
        credentialId: "credential_1",
        credentialType: "Teaching certificate",
        expiresAt: null,
      })
    ).rejects.toThrow("mentorId is required");
  });
});
