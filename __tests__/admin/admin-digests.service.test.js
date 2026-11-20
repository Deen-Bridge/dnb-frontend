import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const put = vi.fn();

vi.mock("@/lib/config/axios.config", () => ({
  default: { get, put },
}));

const { getDigestConfig, updateDigestConfig } = await import(
  "@/lib/actions/admin-digests"
);

const validConfig = {
  digests: {
    moderation: { enabled: true },
    revenue: { enabled: false },
    signups: { enabled: false },
  },
  schedule: { dayOfWeek: 1, hour: 9, minute: 0, timezone: "UTC" },
  recipients: ["admin@example.com"],
};

describe("admin digest service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the server response without inventing recipients", async () => {
    const response = { config: { ...validConfig, recipients: [] } };
    get.mockResolvedValueOnce({ data: response });

    await expect(getDigestConfig()).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/api/admin/digests");
  });

  it("propagates an unavailable backend instead of falling back locally", async () => {
    const error = new Error("Service unavailable");
    get.mockRejectedValueOnce(error);

    await expect(getDigestConfig()).rejects.toBe(error);
  });

  it("sends a valid complete configuration to the authenticated API", async () => {
    const response = { config: validConfig };
    put.mockResolvedValueOnce({ data: response });

    await expect(updateDigestConfig(validConfig)).resolves.toEqual(response);
    expect(put).toHaveBeenCalledWith("/api/admin/digests", validConfig);
  });

  it("does not call the server for invalid configuration", async () => {
    await expect(
      updateDigestConfig({ ...validConfig, recipients: [] })
    ).rejects.toThrow("Add at least one recipient");
    expect(put).not.toHaveBeenCalled();
  });
});
