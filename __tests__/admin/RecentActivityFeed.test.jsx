import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const state = vi.hoisted(() => ({ current: [] }));
vi.mock("@/lib/actions/admin-recent-events", () => ({
  fetchRecentEvents: () => Promise.resolve(state.current),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import RecentActivityFeed from "@/components/admin/RecentActivityFeed";

describe("RecentActivityFeed", () => {
  it("shows the empty state", async () => {
    state.current = [];
    render(<RecentActivityFeed />);
    expect(await screen.findByText("No recent activity yet.")).toBeTruthy();
  });

  it("links the actor to the admin detail page", async () => {
    state.current = [
      {
        id: "1",
        type: "user_signup",
        actorId: "u1",
        actorName: "Aisha",
        description: "joined the platform",
        createdAt: new Date().toISOString(),
      },
    ];
    render(<RecentActivityFeed />);
    const link = await screen.findByText("Aisha");
    expect(link.getAttribute("href")).toBe("/admin/users/u1");
  });
});
