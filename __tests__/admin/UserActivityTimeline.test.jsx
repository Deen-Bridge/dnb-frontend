/**
 * User activity timeline (#227)
 * -----------------------------
 * Pins the composed feed: sources merged into one chronologically sorted
 * (newest first) list, untimestamped entries omitted rather than guessed,
 * partial-source degradation, cursor pagination, and the card UI (type
 * icons, relative timestamps, "load more").
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const fetchGlobalTransactionsMock = vi.hoisted(() => vi.fn());
const fetchVerificationHistoryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/actions/admin-transactions", () => ({
  fetchGlobalTransactions: fetchGlobalTransactionsMock,
}));
vi.mock("@/lib/actions/admin-verification-history", () => ({
  fetchEducatorVerificationHistory: fetchVerificationHistoryMock,
}));

import {
  fetchUserActivityTimeline,
  paginateActivityEvents,
} from "@/lib/actions/admin-user-timeline";
import UserActivityTimeline from "@/components/admin/UserActivityTimeline";

const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(Date.now() - offsetDays * DAY).toISOString();

const BASE_USER = {
  _id: "usr_1",
  createdAt: iso(10), // oldest — account created
  lastLoginAt: iso(2),
  messagesCount: 12,
  lastMessageAt: iso(3),
  walletAddress: "GABC",
  enrolledCourses: [
    { _id: "c2", title: "Advanced Tajweed", enrolledAt: iso(5) },
    { _id: "c1", title: "Arabic 101", enrolledAt: iso(7) },
    "course-without-timestamp", // no timestamp — must be omitted, not guessed
  ],
  purchases: [{ id: "p1", title: "Legacy purchase", amount: "$4.00", date: iso(6) }],
};

const TX = [
  {
    _id: "tx_1",
    itemTitle: "Tafsir of Surah Al-Fatihah",
    amount: 24.5,
    currency: "USDC",
    status: "confirmed",
    createdAt: iso(4),
  },
  {
    _id: "tx_2",
    itemTitle: "Seerah intensive",
    amount: 10,
    currency: "USDC",
    status: "failed",
    createdAt: iso(1),
  },
];

const VERIFICATION_EVENTS = [
  {
    id: "v1",
    type: "approved",
    label: "Approved",
    actor: "Admin review team",
    note: "Documents verified",
    timestamp: iso(6),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  fetchGlobalTransactionsMock.mockResolvedValue({
    success: true,
    transactions: TX,
    pagination: { page: 1, limit: 50, total: TX.length, pages: 1 },
  });
  fetchVerificationHistoryMock.mockResolvedValue({
    source: "backend",
    events: VERIFICATION_EVENTS,
  });
});

describe("fetchUserActivityTimeline", () => {
  it("merges every source into one chronologically sorted (newest first) feed", async () => {
    const { events, degraded } = await fetchUserActivityTimeline(BASE_USER);

    expect(degraded).toEqual([]);
    expect(events.map((e) => e.type)).toEqual([
      "purchase", // failed payment, 1 day ago
      "login", // 2 days ago
      "messages", // 3 days ago
      "purchase", // confirmed tx, 4 days ago
      "enrollment", // Advanced Tajweed, 5 days ago
      "verification", // 6 days ago
      "enrollment", // Arabic 101, 7 days ago
      "signup", // 10 days ago
    ]);

    // Strictly descending timestamps across all sources.
    const stamps = events.map((e) => new Date(e.timestamp).getTime());
    expect(stamps).toEqual([...stamps].sort((a, b) => b - a));

    const titles = events.map((e) => e.title);
    expect(titles).toContain("Account created");
    expect(titles).toContain("Last signed in");
    expect(titles).toContain("12 messages sent");
    expect(titles).toContain("Enrolled in Arabic 101");
    expect(titles).toContain("Purchased Tafsir of Surah Al-Fatihah");
    expect(titles).toContain("Payment failed — Seerah intensive");
    expect(titles).toContain("Approved");
  });

  it("omits untimestamped entries instead of guessing a date", async () => {
    const { events } = await fetchUserActivityTimeline(BASE_USER);
    expect(events.some((e) => e.id.includes("course-without-timestamp"))).toBe(false);
  });

  it("degrades gracefully when the purchases endpoint fails, falling back to record purchases", async () => {
    fetchGlobalTransactionsMock.mockRejectedValue(new Error("network down"));

    const { events, degraded } = await fetchUserActivityTimeline(BASE_USER);

    expect(degraded).toEqual([
      "Purchase history could not be loaded from the transactions endpoint.",
    ]);
    expect(events.map((e) => e.title)).toContain("Purchased Legacy purchase");
    expect(events.map((e) => e.title)).not.toContain("Purchased Tafsir of Surah Al-Fatihah");
  });

  it("never throws, even when every source fails", async () => {
    fetchGlobalTransactionsMock.mockRejectedValue(new Error("down"));
    fetchVerificationHistoryMock.mockRejectedValue(new Error("down"));

    // Wallet present so the purchases source is actually attempted (and fails);
    // without one the source is skipped by design, not degraded.
    const bare = { _id: "usr_2", walletAddress: "GFAIL" };
    const { events, degraded } = await fetchUserActivityTimeline(bare);

    expect(events).toEqual([]);
    expect(degraded).toEqual([
      "Purchase history could not be loaded from the transactions endpoint.",
      "Verification events could not be loaded.",
    ]);
  });
});

describe("paginateActivityEvents", () => {
  const makeEvents = (count) =>
    Array.from({ length: count }, (_, i) => ({
      id: `e${i}`,
      type: "signup",
      title: `Event ${i}`,
      timestamp: iso(i),
    }));

  it("pages with a cursor and reports null when the feed is exhausted", () => {
    const events = makeEvents(12);

    const first = paginateActivityEvents(events, null, 10);
    expect(first.items).toHaveLength(10);
    expect(first.items[0].id).toBe("e0");
    expect(first.nextCursor).toBe("10");

    const second = paginateActivityEvents(events, first.nextCursor, 10);
    expect(second.items).toHaveLength(2);
    expect(second.nextCursor).toBeNull();
  });

  it("returns an empty final page for an exact multiple", () => {
    const events = makeEvents(20);
    const first = paginateActivityEvents(events, null, 10);
    const second = paginateActivityEvents(events, first.nextCursor, 10);
    expect(second.items).toHaveLength(10);
    expect(second.nextCursor).toBeNull();
  });
});

describe("<UserActivityTimeline />", () => {
  it("renders merged events with type labels and relative timestamps", async () => {
    render(<UserActivityTimeline user={BASE_USER} />);

    expect(await screen.findByText("Last signed in")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("12 messages sent")).toBeInTheDocument();

    // Relative timestamps rendered on <time> elements with a machine-readable
    // datetime attribute and an absolute title.
    const timeEls = document.querySelectorAll("time");
    expect(timeEls.length).toBeGreaterThan(0);
    expect(timeEls[0].textContent).toMatch(/ago|now/i);
    expect(timeEls[0].getAttribute("datetime")).toBeTruthy();
    expect(timeEls[0].getAttribute("title")).toBeTruthy();

    // Type chip for the login event.
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("shows a load-more control for long feeds and reveals the rest on click", async () => {
    const many = Array.from({ length: 14 }, (_, i) => ({
      _id: `tx_${i}`,
      itemTitle: `Course ${i}`,
      amount: 5,
      currency: "USDC",
      status: "confirmed",
      createdAt: iso(i + 1),
    }));
    fetchGlobalTransactionsMock.mockResolvedValue({
      success: true,
      transactions: many,
      pagination: { page: 1, limit: 50, total: many.length, pages: 1 },
    });

    render(<UserActivityTimeline user={BASE_USER} />);

    const loadMore = await screen.findByRole("button", { name: /load more/i });
    expect(loadMore).toBeInTheDocument();
    expect(screen.queryByText("End of timeline")).not.toBeInTheDocument();

    fireEvent.click(loadMore);

    expect(await screen.findByText(/End of timeline/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  it("surfaces degraded sources without failing the card", async () => {
    fetchGlobalTransactionsMock.mockRejectedValue(new Error("down"));

    render(<UserActivityTimeline user={BASE_USER} />);

    expect(await screen.findByText(/purchase history could not be loaded/i)).toBeInTheDocument();
    // The rest of the feed still renders.
    expect(await screen.findByText("Last signed in")).toBeInTheDocument();
  });

  it("renders an empty state when the record carries no activity", async () => {
    fetchGlobalTransactionsMock.mockResolvedValue({
      success: true,
      transactions: [],
      pagination: { page: 1, limit: 0, total: 0, pages: 0 },
    });
    fetchVerificationHistoryMock.mockResolvedValue({
      source: "composed",
      events: [],
    });

    render(<UserActivityTimeline user={{ _id: "usr_empty" }} />);

    expect(await screen.findByText("No activity recorded yet.")).toBeInTheDocument();
  });
});
