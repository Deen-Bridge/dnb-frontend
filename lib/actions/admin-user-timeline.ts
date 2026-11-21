import axiosInstance from "@/lib/config/axios.config";

export type ActivityEventType =
  | "signup"
  | "login"
  | "purchase"
  | "enrollment"
  | "messages"
  | "verification";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  detail?: string | null;
  actor?: string | null;
  timestamp: string;
  provenance: string;
  timestampSemantics: string;
}

export interface ActivityTimelinePage {
  events: ActivityEvent[];
  nextCursor: string | null;
  snapshot: string | null;
  degraded: string[];
}

const EVENT_TYPES = new Set<ActivityEventType>([
  "signup",
  "login",
  "purchase",
  "enrollment",
  "messages",
  "verification",
]);

function toIso(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function normalizeEvent(raw: unknown): ActivityEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const event = raw as Record<string, unknown>;
  const timestamp = toIso(event.timestamp);
  const type = event.type;
  const id = toText(event.id);
  const provenance = toText(event.provenance ?? event.source);
  const timestampSemantics = toText(event.timestampSemantics ?? event.timestamp_semantics);

  if (
    !id ||
    !timestamp ||
    typeof type !== "string" ||
    !EVENT_TYPES.has(type as ActivityEventType) ||
    !provenance ||
    !timestampSemantics
  ) {
    return null;
  }

  return {
    id,
    type: type as ActivityEventType,
    title: toText(event.title) || "Activity update",
    detail: toText(event.detail),
    actor: toText(event.actor),
    timestamp,
    provenance,
    timestampSemantics,
  };
}

function normalizeDegraded(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const source = toText((entry as Record<string, unknown>).source);
        const reason = toText((entry as Record<string, unknown>).reason);
        if (source && reason) return `${source}: ${reason}`;
        return reason || source;
      }
      return null;
    })
    .filter((entry): entry is string => Boolean(entry));
}

function uniqueEvents(events: ActivityEvent[]): ActivityEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

/** Reads the authenticated, admin-authorized aggregate activity contract. */
export async function fetchUserActivityTimeline(
  userId: string,
  options: { cursor?: string | null; snapshot?: string | null; limit?: number } = {}
): Promise<ActivityTimelinePage> {
  if (!userId) throw new Error("A user id is required to load activity.");

  const { data } = await axiosInstance.get(
    `/api/admin/users/${encodeURIComponent(userId)}/activity`,
    {
      params: {
        limit: options.limit || 10,
        ...(options.cursor ? { cursor: options.cursor } : {}),
        ...(options.snapshot ? { snapshot: options.snapshot } : {}),
      },
    }
  );

  if (data?.success === false) {
    throw new Error(data.message || "The activity timeline is unavailable.");
  }

  const rawEvents = Array.isArray(data?.events)
    ? data.events
    : Array.isArray(data?.items)
      ? data.items
      : [];
  const events = uniqueEvents(
    rawEvents
      .map((event: unknown) => normalizeEvent(event))
      .filter((event: ActivityEvent | null): event is ActivityEvent => event !== null)
  );

  return {
    events,
    nextCursor: toText(data?.nextCursor ?? data?.pagination?.nextCursor),
    snapshot: toText(data?.snapshot ?? data?.pagination?.snapshot),
    degraded: normalizeDegraded(data?.degraded),
  };
}
