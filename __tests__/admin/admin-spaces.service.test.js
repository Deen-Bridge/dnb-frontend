import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import { logAdminAction } from "@/lib/actions/admin-audit";
import { notifyHostOfEmergencyStop } from "@/lib/services/notifications";
import {
  EmergencyStopError,
  emergencyStopLiveSpace,
} from "@/lib/actions/admin-spaces";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("@/lib/actions/admin-audit", () => ({
  logAdminAction: vi.fn(),
}));

vi.mock("@/lib/services/notifications", () => ({
  notifyHostOfEmergencyStop: vi.fn(),
}));

const SPACE = {
  id: "space-101",
  roomName: "Seerah Community Q&A",
  hostId: "host-104",
};

const REQUEST = {
  reason: "Immediate policy violation",
  actor: { id: "admin-1", name: "Admin User" },
};

beforeEach(() => {
  vi.clearAllMocks();
  logAdminAction.mockResolvedValue({ id: "log-new" });
  notifyHostOfEmergencyStop.mockResolvedValue({ queued: true });
});

describe("emergencyStopLiveSpace", () => {
  it("ends a supported session, notifies the host, and records the reason", async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, ended: true },
    });

    const result = await emergencyStopLiveSpace(SPACE, REQUEST);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/admin/spaces/space-101/end",
      { reason: REQUEST.reason },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(result.status).toBe("ended");
    expect(result.notificationSent).toBe(true);
    expect(result.auditLogged).toBe(true);
    expect(notifyHostOfEmergencyStop).toHaveBeenCalledWith(
      SPACE.hostId,
      expect.objectContaining({
        spaceId: SPACE.id,
        roomName: SPACE.roomName,
        reason: REQUEST.reason,
      })
    );
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "moderation.live_space_emergency_stop",
        category: "moderation",
        summary: expect.stringContaining(REQUEST.reason),
      })
    );
  });

  it("returns an explicit unsupported outcome when the endpoint is unavailable", async () => {
    axiosInstance.post.mockRejectedValue({ response: { status: 501 } });

    const result = await emergencyStopLiveSpace(SPACE, REQUEST);

    expect(result.status).toBe("unsupported");
    expect(result.message).toMatch(/not supported/i);
    expect(result.notificationSent).toBe(false);
    expect(notifyHostOfEmergencyStop).not.toHaveBeenCalled();
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ summary: expect.stringMatching(/unsupported/i) })
    );
  });

  it("reports a clear backend rejection and audits the failed attempt", async () => {
    axiosInstance.post.mockRejectedValue({
      response: {
        status: 409,
        data: { message: "The session has already ended." },
      },
    });

    await expect(emergencyStopLiveSpace(SPACE, REQUEST)).rejects.toMatchObject({
      name: "EmergencyStopError",
      code: "BACKEND_REJECTED",
      message: "The session has already ended.",
      auditLogged: true,
    });
    expect(notifyHostOfEmergencyStop).not.toHaveBeenCalled();
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ summary: expect.stringContaining(REQUEST.reason) })
    );
  });

  it("reports timeout uncertainty and audits the attempt", async () => {
    axiosInstance.post.mockRejectedValue({ code: "ECONNABORTED" });

    await expect(emergencyStopLiveSpace(SPACE, REQUEST)).rejects.toMatchObject({
      name: "EmergencyStopError",
      code: "TIMEOUT",
      message: expect.stringMatching(/timed out.*may still be live/i),
      auditLogged: true,
    });
    expect(notifyHostOfEmergencyStop).not.toHaveBeenCalled();
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ summary: expect.stringMatching(/timed out/i) })
    );
  });

  it("requires a reason before contacting the backend", async () => {
    await expect(
      emergencyStopLiveSpace(SPACE, { ...REQUEST, reason: "  " })
    ).rejects.toBeInstanceOf(EmergencyStopError);
    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(logAdminAction).not.toHaveBeenCalled();
  });

  it("preserves a confirmed stop when notification delivery fails", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true, ended: true } });
    notifyHostOfEmergencyStop.mockRejectedValue(new Error("Notification unavailable"));

    const result = await emergencyStopLiveSpace(SPACE, REQUEST);

    expect(result.status).toBe("ended");
    expect(result.notificationSent).toBe(false);
    expect(result.warnings).toContain("The host notification could not be queued.");
    expect(result.auditLogged).toBe(true);
  });
});
