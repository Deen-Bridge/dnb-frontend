import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from "@/lib/config/axios.config";
import {
  changeAccountPassword,
  deleteAccount,
  getAccountPreferences,
  updateAccountPreferences,
} from "@/lib/actions/users/accountSettings";

beforeEach(() => vi.clearAllMocks());

describe("account settings actions", () => {
  it("loads authoritative preferences from the authenticated endpoint", async () => {
    const preferences = { notifications: { email: false }, privacy: { showActivity: false } };
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: preferences } });

    await expect(getAccountPreferences()).resolves.toEqual(preferences);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/users/me/preferences");
  });

  it("sends only the requested preference groups", async () => {
    const payload = { privacy: { profileVisibility: "private" } };
    axiosInstance.put.mockResolvedValue({ data: { data: payload } });

    await expect(updateAccountPreferences(payload)).resolves.toEqual(payload);
    expect(axiosInstance.put).toHaveBeenCalledWith(
      "/api/users/me/preferences",
      payload
    );
  });

  it("surfaces backend failures instead of reporting success", async () => {
    axiosInstance.put.mockRejectedValue({ response: { data: { message: "Invalid password" } } });

    await expect(
      changeAccountPassword({ currentPassword: "old", newPassword: "new" })
    ).rejects.toThrow("Invalid password");
  });

  it("deletes only the authenticated user's account endpoint", async () => {
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });

    await expect(deleteAccount("user/123")).resolves.toEqual({ success: true });
    expect(axiosInstance.delete).toHaveBeenCalledWith("/api/users/user%2F123");
  });
});
