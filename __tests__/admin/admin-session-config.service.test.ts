import axiosInstance from "@/lib/config/axios.config";
import {
  getSessionSecurityConfig,
  SESSION_SECURITY_ENDPOINT,
  updateSessionSecurityConfig,
  validateSessionSecurityConfig,
} from "@/lib/actions/admin-session-config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const axiosMock = axiosInstance as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

describe("admin session-security service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the effective policy from the authorized endpoint", async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        policy: {
          idleTimeoutMinutes: 20,
          idleWarningSeconds: 90,
          reauthAfterMinutes: 45,
          version: 3,
          updatedAt: "2026-11-19T10:00:00.000Z",
        },
      },
    });

    await expect(getSessionSecurityConfig()).resolves.toEqual({
      idleTimeoutMinutes: 20,
      idleWarningSeconds: 90,
      reauthAfterMinutes: 45,
      version: 3,
      updatedAt: "2026-11-19T10:00:00.000Z",
    });
    expect(axiosMock.get).toHaveBeenCalledWith(SESSION_SECURITY_ENDPOINT);
  });

  it("persists a validated policy with the server revision", async () => {
    axiosMock.put.mockResolvedValue({
      data: {
        idleTimeoutMinutes: 25,
        idleWarningSeconds: 120,
        reauthAfterMinutes: 60,
        version: 4,
      },
    });

    await expect(updateSessionSecurityConfig({
      idleTimeoutMinutes: 25,
      idleWarningSeconds: 120,
      reauthAfterMinutes: 60,
      version: 3,
    })).resolves.toMatchObject({ version: 4, idleTimeoutMinutes: 25 });

    expect(axiosMock.put).toHaveBeenCalledWith(SESSION_SECURITY_ENDPOINT, {
      idleTimeoutMinutes: 25,
      idleWarningSeconds: 120,
      reauthAfterMinutes: 60,
      version: 3,
    });
  });

  it("rejects invalid values before making a request", async () => {
    expect(validateSessionSecurityConfig({
      idleTimeoutMinutes: 10,
      idleWarningSeconds: 600,
      reauthAfterMinutes: 30,
    }).valid).toBe(false);

    await expect(updateSessionSecurityConfig({
      idleTimeoutMinutes: 10,
      idleWarningSeconds: 600,
      reauthAfterMinutes: 30,
    })).rejects.toMatchObject({ fieldErrors: { idleWarningSeconds: expect.any(String) } });
    expect(axiosMock.put).not.toHaveBeenCalled();
  });

  it("turns a stale revision into an actionable conflict", async () => {
    axiosMock.put.mockRejectedValue({ response: { status: 409, data: { message: "Policy is stale" } } });

    await expect(updateSessionSecurityConfig({
      idleTimeoutMinutes: 20,
      idleWarningSeconds: 60,
      reauthAfterMinutes: 30,
      version: 2,
    })).rejects.toMatchObject({ code: "SESSION_POLICY_CONFLICT", status: 409, message: "Policy is stale" });
  });
});
