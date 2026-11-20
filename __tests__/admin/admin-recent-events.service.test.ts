import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import {
  fetchRecentEvents,
  MAX_RECENT_EVENTS_LIMIT,
  normaliseResponse,
} from "@/lib/actions/admin-recent-events";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn() },
}));

describe("admin recent events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bounds requests and normalises, orders, and deduplicates events", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        events: [
          { id: "new", type: "payment", actorId: "u2", actorName: "B", description: "paid", createdAt: "2026-11-20T12:00:00Z" },
          { id: "old", type: "report", actorId: "u1", actorName: "A", description: "reported", createdAt: "2026-11-20T11:00:00Z" },
          { id: "new", type: "payment", actorId: "u2", actorName: "B", description: "paid", createdAt: "2026-11-20T12:00:00Z" },
          { id: "bad", type: "secret_event", actorId: "u3", actorName: "C", description: "hidden", createdAt: "2026-11-20T10:00:00Z" },
        ],
      },
    });

    const result = await fetchRecentEvents(999, { cursor: "next", since: "2026-11-20T00:00:00Z" });

    expect(result.events.map((event) => event.id)).toEqual(["new", "old"]);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/recent-events",
      expect.objectContaining({
        params: { limit: MAX_RECENT_EVENTS_LIMIT, cursor: "next", since: "2026-11-20T00:00:00Z" },
        timeout: 10_000,
        retryOnServerError: true,
      })
    );
  });

  it("normalises a bare array response for compatible servers", () => {
    expect(normaliseResponse([{ id: "1", type: "user_signup", actorId: "u", actorName: "A", description: "joined", createdAt: "2026-11-20T12:00:00Z" }]).events).toHaveLength(1);
  });

  it("rejects server failures with a readable message", async () => {
    vi.mocked(axiosInstance.get).mockRejectedValueOnce({
      response: { status: 503, data: { message: "Events unavailable" } },
    });
    await expect(fetchRecentEvents()).rejects.toMatchObject({
      message: "Events unavailable",
      status: 503,
      unavailable: true,
    });
  });
});
