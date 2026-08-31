import axiosInstance from "@/lib/config/axios.config";
import { logAdminAction } from "@/lib/actions/admin-audit";
import { notifyHostOfEmergencyStop } from "@/lib/services/notifications";

export const EMERGENCY_STOP_TIMEOUT_MS = 10000;

export interface EmergencyStopErrorOptions {
  auditLogged?: boolean;
}

export class EmergencyStopError extends Error {
  code?: string;
  auditLogged?: boolean;

  constructor(message: string, code?: string, options: EmergencyStopErrorOptions = {}) {
    super(message);
    this.name = "EmergencyStopError";
    this.code = code;
    this.auditLogged = Boolean(options.auditLogged);
  }
}

export interface SpaceDescriptor {
  id: string;
  roomName: string;
  hostId?: string;
  [key: string]: any; // TODO(types): Space descriptor item payload
}

export interface EmergencyStopActor {
  id?: string;
  name?: string;
}

export interface EmergencyStopRequest {
  reason: string;
  actor?: EmergencyStopActor;
}

export interface EmergencyStopOptions {
  timeoutMs?: number;
}

function validateRequest(space?: SpaceDescriptor, reason?: string): void {
  if (!space?.id || !space?.roomName) {
    throw new EmergencyStopError(
      "This live space does not have enough information to be stopped.",
      "INVALID_SPACE"
    );
  }

  if (!reason?.trim()) {
    throw new EmergencyStopError(
      "Enter a reason for ending this live space.",
      "REASON_REQUIRED"
    );
  }
}

function isUnsupported(error: any): boolean { // TODO(types): Error response object
  return [404, 405, 501].includes(error?.response?.status);
}

function isTimeout(error: any, controller: AbortController): boolean { // TODO(types): Timeout error object
  return (
    controller.signal.aborted ||
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT" ||
    error?.code === "ERR_CANCELED" ||
    error?.name === "AbortError"
  );
}

function rejectionMessage(error: any): string { // TODO(types): Backend rejection error object
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "The server rejected the emergency-stop request. The space may still be live."
  );
}

interface WriteAuditEntryParams {
  space: SpaceDescriptor;
  reason: string;
  actor?: EmergencyStopActor;
  outcome: string;
  detail?: string;
}

async function writeAuditEntry({ space, reason, actor, outcome, detail }: WriteAuditEntryParams): Promise<boolean> {
  try {
    await logAdminAction({
      actor: actor as any, // TODO(types): Actor credential for admin audit
      action: "moderation.live_space_emergency_stop",
      category: "moderation",
      target: {
        label: space.roomName,
        href: `/dashboard/spaces/${space.id}`,
      },
      summary: `Emergency stop ${outcome} for “${space.roomName}”. Reason: ${reason.trim()}${
        detail ? ` Outcome: ${detail}` : ""
      }`,
      ip: null,
    });
    return true;
  } catch {
    return false;
  }
}

export interface EmergencyStopResult {
  status: "ended" | "unsupported";
  message: string;
  notificationSent: boolean;
  auditLogged: boolean;
  warnings: string[];
}

/**
 * End a live space and perform the associated moderation side effects.
 */
export async function emergencyStopLiveSpace(
  space: SpaceDescriptor,
  request: EmergencyStopRequest,
  options: EmergencyStopOptions = {}
): Promise<EmergencyStopResult> {
  const reason = request?.reason || "";
  validateRequest(space, reason);

  const timeoutMs = options.timeoutMs ?? EMERGENCY_STOP_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let backendOutcome: "ended" | "unsupported" | undefined;

  try {
    const response = await axiosInstance.post(
      `/api/admin/spaces/${encodeURIComponent(space.id)}/end`,
      { reason: reason.trim() },
      { signal: controller.signal }
    );

    if (response?.data?.supported === false) {
      backendOutcome = "unsupported";
    } else if (response?.data?.success === false || response?.data?.ended === false) {
      throw new EmergencyStopError(
        response?.data?.message ||
          "The server rejected the emergency-stop request. The space may still be live.",
        "BACKEND_REJECTED"
      );
    } else {
      backendOutcome = "ended";
    }
  } catch (error: any) { // TODO(types): Error from emergency stop request
    if (error instanceof EmergencyStopError) {
      const auditLogged = await writeAuditEntry({
        space,
        reason,
        actor: request?.actor,
        outcome: "was rejected",
        detail: error.message,
      });
      error.auditLogged = auditLogged;
      throw error;
    }

    if (isUnsupported(error)) {
      backendOutcome = "unsupported";
    } else if (isTimeout(error, controller)) {
      const message =
        "The emergency-stop request timed out. The space may still be live; verify its status before trying again.";
      const auditLogged = await writeAuditEntry({
        space,
        reason,
        actor: request?.actor,
        outcome: "timed out",
        detail: message,
      });
      throw new EmergencyStopError(message, "TIMEOUT", { auditLogged });
    } else {
      const message = rejectionMessage(error);
      const auditLogged = await writeAuditEntry({
        space,
        reason,
        actor: request?.actor,
        outcome: "failed",
        detail: message,
      });
      throw new EmergencyStopError(message, "BACKEND_REJECTED", {
        auditLogged,
      });
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (backendOutcome === "unsupported") {
    const message =
      "Emergency stop is not supported by the connected backend. No termination was confirmed.";
    const auditLogged = await writeAuditEntry({
      space,
      reason,
      actor: request?.actor,
      outcome: "was unsupported",
      detail: message,
    });

    return {
      status: "unsupported",
      message,
      notificationSent: false,
      auditLogged,
      warnings: auditLogged ? [] : ["The audit entry could not be recorded."],
    };
  }

  const endedAt = new Date().toISOString();
  const warnings: string[] = [];
  let notificationSent = false;

  if (space.hostId) {
    try {
      await notifyHostOfEmergencyStop(space.hostId, {
        spaceId: space.id,
        roomName: space.roomName,
        reason: reason.trim(),
        endedAt,
      });
      notificationSent = true;
    } catch {
      warnings.push("The host notification could not be queued.");
    }
  } else {
    warnings.push("The host notification could not be queued because the host is unknown.");
  }

  const auditLogged = await writeAuditEntry({
    space,
    reason,
    actor: request?.actor,
    outcome: "was completed",
    detail: "The backend confirmed that the session ended.",
  });

  if (!auditLogged) {
    warnings.push("The audit entry could not be recorded.");
  }

  return {
    status: "ended",
    message: `“${space.roomName}” was ended successfully.`,
    notificationSent,
    auditLogged,
    warnings,
  };
}
