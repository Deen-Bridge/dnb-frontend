import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const getMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/config/axios.config", () => ({ default: { get: getMock } }));

import { fetchUserActivityTimeline } from "@/lib/actions/admin-user-timeline";
import UserActivityTimeline from "@/components/admin/UserActivityTimeline";

const event = (id, timestamp, extra = {}) => ({
  id,
  type: "purchase",
  title: `Event ${id}`,
  timestamp,
  provenance: "payments.transaction",
  timestampSemantics: "occurred_at",
  ...extra,
});

beforeEach(() => vi.clearAllMocks());

describe("fetchUserActivityTimeline", () => {
  it("uses one authenticated aggregate endpoint and preserves the snapshot cursor contract", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        snapshot: "snap-1",
        events: [event("e1", "2026-11-20T10:00:00Z"), event("e1", "2026-11-20T10:00:00Z"), { id: "invalid" }],
        nextCursor: "cursor-1",
        degraded: [{ source: "verification", reason: "timeout" }],
      },
    });

    const result = await fetchUserActivityTimeline("user/1", { limit: 10 });

    expect(getMock).toHaveBeenCalledWith("/api/admin/users/user%2F1/activity", {
      params: { limit: 10 },
    });
    expect(result.events).toHaveLength(1);
    expect(result.nextCursor).toBe("cursor-1");
    expect(result.snapshot).toBe("snap-1");
    expect(result.degraded).toEqual(["verification: timeout"]);
  });

  it("sends the cursor and snapshot without composing local records", async () => {
    getMock.mockResolvedValue({ data: { events: [], nextCursor: null, snapshot: "snap-1" } });

    await fetchUserActivityTimeline("user-1", { cursor: "cursor-1", snapshot: "snap-1", limit: 10 });

    expect(getMock).toHaveBeenCalledWith("/api/admin/users/user-1/activity", {
      params: { limit: 10, cursor: "cursor-1", snapshot: "snap-1" },
    });
  });

  it("rejects an unavailable server response instead of using a mock fallback", async () => {
    getMock.mockResolvedValue({ data: { success: false, message: "admin authorization required" } });

    await expect(fetchUserActivityTimeline("user-1")).rejects.toThrow("admin authorization required");
  });
});

describe("<UserActivityTimeline />", () => {
  it("renders server events and loads the next server cursor", async () => {
    getMock
      .mockResolvedValueOnce({ data: { events: [event("e1", "2026-11-20T10:00:00Z", { title: "Server event" })], snapshot: "snap-1", nextCursor: "cursor-1" } })
      .mockResolvedValueOnce({ data: { events: [event("e2", "2026-11-19T10:00:00Z", { title: "Second server event" })], snapshot: "snap-1", nextCursor: null } });

    render(<UserActivityTimeline user={{ _id: "user-1" }} />);
    expect(await screen.findByText("Server event")).toBeInTheDocument();
    expect(screen.getByText(/Source: payments.transaction/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("Second server event")).toBeInTheDocument();
    expect(getMock).toHaveBeenLastCalledWith("/api/admin/users/user-1/activity", {
      params: { limit: 10, cursor: "cursor-1", snapshot: "snap-1" },
    });
  });

  it("shows an explicit unavailable state when the aggregate endpoint fails", async () => {
    getMock.mockRejectedValue(new Error("service unavailable"));

    render(<UserActivityTimeline user={{ _id: "user-1" }} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("service unavailable");
    expect(screen.queryByText(/Purchased/)).not.toBeInTheDocument();
  });
});
