import { beforeEach, describe, expect, it, vi } from "vitest";

const axios = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/lib/config/axios.config", () => ({ default: axios }));

import {
  getDigestConfig,
  updateDigestConfig,
} from "@/lib/actions/admin-digests";
import {
  getMaintenanceState,
  setMaintenanceState,
} from "@/lib/actions/admin-maintenance";
import {
  clearEmergencyBroadcast,
  getActiveEmergencyBroadcast,
  sendEmergencyBroadcast,
} from "@/lib/actions/admin-emergency-broadcast";

const validDigestConfig = {
  digests: {
    moderation: { enabled: true },
    revenue: { enabled: false },
    signups: { enabled: false },
  },
  schedule: { dayOfWeek: 1, hour: 9, minute: 0, timezone: "UTC" },
  recipients: ["ops@example.com"],
};

describe("production admin action integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and persists digest configuration through the API", async () => {
    axios.get.mockResolvedValueOnce({ data: { config: validDigestConfig } });
    axios.put.mockResolvedValueOnce({ data: { config: validDigestConfig } });

    await expect(getDigestConfig()).resolves.toEqual({ config: validDigestConfig });
    await expect(updateDigestConfig(validDigestConfig)).resolves.toEqual({
      config: validDigestConfig,
    });
    expect(axios.get).toHaveBeenCalledWith("/api/admin/digests");
    expect(axios.put).toHaveBeenCalledWith("/api/admin/digests", validDigestConfig);
  });

  it("does not send invalid digest config to the backend", async () => {
    await expect(updateDigestConfig({})).rejects.toThrow();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it("uses server-owned maintenance identity and state", async () => {
    const response = { maintenance: { enabled: true, updatedBy: { id: "admin-1" } } };
    axios.get.mockResolvedValueOnce({ data: response });
    axios.put.mockResolvedValueOnce({ data: response });

    await expect(getMaintenanceState()).resolves.toEqual(response);
    await expect(
      setMaintenanceState({ enabled: true, message: "Back soon", actor: { id: "spoof" } })
    ).resolves.toEqual(response);
    expect(axios.get).toHaveBeenCalledWith("/api/admin/maintenance");
    expect(axios.put).toHaveBeenCalledWith("/api/admin/maintenance", {
      enabled: true,
      message: "Back soon",
    });
  });

  it("round-trips emergency broadcast operations through the API", async () => {
    const response = { broadcast: { id: "incident-1" } };
    axios.get.mockResolvedValueOnce({ data: { broadcast: null } });
    axios.post.mockResolvedValueOnce({ data: response });
    axios.delete.mockResolvedValueOnce({ data: { broadcast: null } });

    await expect(getActiveEmergencyBroadcast()).resolves.toEqual({ broadcast: null });
    await expect(
      sendEmergencyBroadcast({
        template: "outage",
        title: "Platform outage",
        affectedAreas: ["courses"],
      })
    ).resolves.toEqual(response);
    await expect(clearEmergencyBroadcast()).resolves.toEqual({ broadcast: null });
    expect(axios.post).toHaveBeenCalledWith("/api/admin/broadcasts/emergency", {
      template: "outage",
      title: "Platform outage",
      body: "We're aware of a platform outage and our team is actively working to restore service. Thank you for your patience.",
      etaAt: null,
      affectedAreas: ["courses"],
    });
    expect(axios.delete).toHaveBeenCalledWith("/api/admin/broadcasts/emergency/active");
  });

  it("preserves API failures instead of claiming an emergency was sent", async () => {
    const failure = new Error("network unavailable");
    axios.post.mockRejectedValueOnce(failure);

    await expect(
      sendEmergencyBroadcast({
        template: "security",
        title: "Security notice",
        affectedAreas: ["payments"],
      })
    ).rejects.toBe(failure);
  });
});
