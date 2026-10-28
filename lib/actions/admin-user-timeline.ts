/**
 * Admin user activity timeline (#227).
 *
 * TODO(backend): there is no aggregate per-user activity endpoint yet
 * (something like GET /api/admin/users/:id/activity). Until one exists this
 * module composes the feed from the per-resource sources that do exist:
 *
 *   - signup date, login hints, enrollment and message counts from the user
 *     record already loaded by the detail page,
 *   - purchases from GET /api/admin/transactions filtered by the learner's
 *     wallet (the same call the purchases tab uses),
 *   - verification events from GET /api/admin/educators/:id/verification-history
 *     with the record-field composition that module already falls back to.
 *
 * Tradeoff of composing (documented per the issue): the feed is only as
 * complete as the sources above. Each source can fail independently — a
 * failed one drops just its own events and is reported in `degraded` instead
 * of failing the page — and events are only as timestamped as their source
 * record: enrollments or message counts without a recorded timestamp cannot
 * be placed on a chronologically sorted feed, so they are omitted rather than
 * guessed at. When the backend ships an aggregate endpoint, swap the body of
 * `fetchUserActivityTimeline` for one request and keep the return shape.
 */

import { fetchGlobalTransactions } from "@/lib/actions/admin-transactions";
import { fetchEducatorVerificationHistory } from "@/lib/actions/admin-verification-history";
import { logger } from "@/lib/logger";

export type ActivityEventType =
  "signup" | "login" | "purchase" | "enrollment" | "messages" | "verification";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  detail?: string | null;
  actor?: string | null;
  /** ISO timestamp — every emitted event is timestamped (see module note). */
  timestamp: string;
}

export interface ActivityTimelineResult {
  /** Newest first, chronologically sorted across all sources. */
  events: ActivityEvent[];
  /** Human-readable notes for sources that could not be read. */
  degraded: string[];
}

/** The slice of the admin user record the composer reads. */
export interface TimelineUser {
  _id?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  enrolledCourses?: unknown[];
  messagesCount?: number;
  lastMessageAt?: string;
  walletAddress?: string;
  purchases?: Array<{ id?: string; title?: string; amount?: string | number; date?: string }>;
  [key: string]: unknown;
}

function firstDefined(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function toIso(value: unknown): string | null {
  const raw = firstDefined(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sortNewestFirst(events: ActivityEvent[]): ActivityEvent[] {
  return [...events].sort((a, b) => {
    const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (diff !== 0) return diff;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  });
}

function signupEvent(user: TimelineUser): ActivityEvent | null {
  const timestamp = toIso(user.createdAt);
  if (!timestamp) return null;
  return {
    id: "signup",
    type: "signup",
    title: "Account created",
    detail: "Registered on DeenBridge",
    timestamp,
  };
}

/**
 * TODO(backend): real per-login history needs an activity/sessions endpoint
 * for admins. Until then the best available signal is the last-login hint on
 * the user record, so the feed shows one login event, not a full history.
 */
function loginEvent(user: TimelineUser): ActivityEvent | null {
  const timestamp = toIso(firstDefined(user.lastLoginAt, user.lastActiveAt));
  if (!timestamp) return null;
  return {
    id: "login",
    type: "login",
    title: "Last signed in",
    detail: "Most recent session on the platform",
    timestamp,
  };
}

/** Purchase events from the admin transactions endpoint, wallet-filtered. */
async function purchaseEvents(user: TimelineUser, degraded: string[]): Promise<ActivityEvent[]> {
  if (!user.walletAddress) return [];

  try {
    const res = await fetchGlobalTransactions({
      buyerWallet: user.walletAddress,
      page: 1,
      limit: 50,
    });
    const transactions = res?.success ? res.transactions || [] : [];
    if (transactions.length > 0) {
      return transactions
        .map((tx, index): ActivityEvent | null => {
          const timestamp = toIso(tx.createdAt);
          if (!timestamp) return null;
          const failed = tx.status === "failed" || tx.status === "expired";
          return {
            id: `purchase-${tx._id || index}`,
            type: "purchase",
            title: failed ? `Payment failed — ${tx.itemTitle}` : `Purchased ${tx.itemTitle}`,
            detail: `${Number(tx.amount).toFixed(2)} ${tx.currency || "USDC"} · ${tx.status}`,
            timestamp,
          };
        })
        .filter((event): event is ActivityEvent => event !== null);
    }
    // Fall through to the record fallback: an empty result usually means the
    // backend endpoint is not wired yet and the mock path returned nothing.
  } catch (error) {
    logger.warn("Activity timeline: purchases source unavailable", error);
    degraded.push("Purchase history could not be loaded from the transactions endpoint.");
  }

  // Fallback: purchases carried on the record itself (mock/dev payloads).
  return (user.purchases || [])
    .map((entry, index): ActivityEvent | null => {
      const timestamp = toIso(entry.date);
      if (!timestamp) return null;
      return {
        id: `purchase-record-${entry.id || index}`,
        type: "purchase",
        title: `Purchased ${entry.title || "an item"}`,
        detail: entry.amount != null ? String(entry.amount) : null,
        timestamp,
      };
    })
    .filter((event): event is ActivityEvent => event !== null);
}

/**
 * Enrollment events from `enrolledCourses`. Entries without a recorded
 * timestamp cannot be placed on a chronological feed and are skipped (see
 * the module note); untimestamped string ids are simply course references.
 */
function enrollmentEvents(user: TimelineUser): ActivityEvent[] {
  const entries = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [];
  return entries
    .map((raw, index): ActivityEvent | null => {
      if (raw === null || raw === undefined) return null;
      const entry = typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      const timestamp = toIso(
        entry
          ? firstDefined(entry.enrolledAt, entry.createdAt, entry.purchasedAt, entry.date)
          : undefined
      );
      if (!timestamp) return null;
      const title =
        (entry && firstDefined(entry.title, entry.courseTitle, entry.name)) || "a course";
      return {
        id: `enrollment-${(entry && firstDefined(entry._id, entry.courseId)) || index}`,
        type: "enrollment",
        title: `Enrolled in ${title}`,
        detail: null,
        timestamp,
      };
    })
    .filter((event): event is ActivityEvent => event !== null);
}

/**
 * TODO(backend): per-user message activity needs an admin-readable endpoint;
 * the record only carries a total. When both the count and a timestamp exist
 * we emit one summary event; an untimestamped count cannot be sorted, so it
 * is omitted rather than pinned to an arbitrary date.
 */
function messagesEvent(user: TimelineUser): ActivityEvent | null {
  const count = user.messagesCount;
  if (typeof count !== "number" || count <= 0) return null;
  const timestamp = toIso(user.lastMessageAt);
  if (!timestamp) return null;
  return {
    id: "messages",
    type: "messages",
    title: `${count} message${count === 1 ? "" : "s"} sent`,
    detail: "Total conversations activity on record",
    timestamp,
  };
}

/** Verification events, reusing the dedicated history module's fallback chain. */
async function verificationEvents(
  user: TimelineUser,
  degraded: string[]
): Promise<ActivityEvent[]> {
  try {
    const userId = String(user._id || "");
    const history = await fetchEducatorVerificationHistory(userId, user);
    const events = Array.isArray(history.events) ? history.events : [];
    return events
      .map((event, index): ActivityEvent | null => {
        const timestamp = toIso(event.timestamp);
        if (!timestamp) return null;
        return {
          id: `verification-${event.id || index}`,
          type: "verification",
          title: event.label || "Verification update",
          detail: event.note || null,
          actor: event.actor || null,
          timestamp,
        };
      })
      .filter((event): event is ActivityEvent => event !== null);
  } catch (error) {
    logger.warn("Activity timeline: verification source unavailable", error);
    degraded.push("Verification events could not be loaded.");
    return [];
  }
}

/**
 * Compose the merged, chronologically sorted (newest first) activity feed.
 * Never throws: a failing source only degrades the feed.
 */
export async function fetchUserActivityTimeline(
  user: TimelineUser
): Promise<ActivityTimelineResult> {
  const degraded: string[] = [];

  const [purchases, verifications] = await Promise.all([
    purchaseEvents(user, degraded),
    verificationEvents(user, degraded),
  ]);

  const events: ActivityEvent[] = [
    signupEvent(user),
    loginEvent(user),
    messagesEvent(user),
    ...enrollmentEvents(user),
    ...purchases,
    ...verifications,
  ].filter((event): event is ActivityEvent => event !== null);

  return { events: sortNewestFirst(events), degraded };
}

export interface ActivityPage {
  items: ActivityEvent[];
  /** Stringified offset of the next page, or null when the feed is exhausted. */
  nextCursor: string | null;
}

/**
 * Cursor pagination over the composed feed. The composition happens on the
 * client, so the cursor is an offset into the sorted feed (opaque to callers)
 * rather than a server-issued key.
 */
export function paginateActivityEvents(
  events: ActivityEvent[],
  cursor?: string | null,
  limit = 10
): ActivityPage {
  const start = Math.max(0, Number(cursor) || 0);
  const items = events.slice(start, start + limit);
  const end = start + items.length;
  return {
    items,
    nextCursor: end < events.length ? String(end) : null,
  };
}
