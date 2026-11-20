import axiosInstance from "@/lib/config/axios.config";

export const RECENT_EVENTS_PATH = "/api/admin/recent-events";
export const MAX_RECENT_EVENTS_LIMIT = 50;
export const RECENT_EVENTS_TIMEOUT_MS = 10_000;

export type RecentEventType =
  | "user_signup"
  | "course_published"
  | "payment"
  | "report"
  | "verification";

export interface RecentEvent {
  id: string;
  type: RecentEventType;
  actorId: string;
  actorName: string;
  description: string;
  createdAt: string;
}

export interface RecentEventsResponse {
  events: RecentEvent[];
  nextCursor: string | null;
  generatedAt: string | null;
}

export interface FetchRecentEventsOptions {
  cursor?: string | null;
  since?: string | null;
  signal?: AbortSignal;
}

export class RecentEventsError extends Error {
  status: number | null;
  unavailable: boolean;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "RecentEventsError";
    this.status = status;
    this.unavailable = status === null || status >= 500;
  }
}

const EVENT_TYPES = new Set<RecentEventType>([
  "user_signup",
  "course_published",
  "payment",
  "report",
  "verification",
]);

function normaliseEvent(value: unknown): RecentEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;
  const id = typeof event.id === "string" ? event.id : "";
  const type = typeof event.type === "string" ? event.type : "";
  const actorId = typeof event.actorId === "string" ? event.actorId : "";
  const actorName = typeof event.actorName === "string" ? event.actorName : "";
  const description = typeof event.description === "string" ? event.description : "";
  const createdAt = typeof event.createdAt === "string" ? event.createdAt : "";

  if (
    !id ||
    !EVENT_TYPES.has(type as RecentEventType) ||
    !actorId ||
    !actorName ||
    !description ||
    !createdAt ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }

  return { id, type: type as RecentEventType, actorId, actorName, description, createdAt };
}

function normaliseResponse(data: unknown): RecentEventsResponse {
  const payload = (Array.isArray(data) ? { events: data } : data ?? {}) as Record<string, unknown>;
  const rawEvents = Array.isArray(payload.events)
    ? payload.events
    : Array.isArray(payload.items)
      ? payload.items
      : [];
  const seen = new Set<string>();
  const events = rawEvents
    .map(normaliseEvent)
    .filter((event): event is RecentEvent => {
      if (!event || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    events,
    nextCursor: typeof payload.nextCursor === "string" ? payload.nextCursor : null,
    generatedAt: typeof payload.generatedAt === "string" ? payload.generatedAt : null,
  };
}

function errorMessage(error: unknown): string {
  const candidate = error as {
    response?: { data?: { message?: unknown; error?: unknown } };
    message?: unknown;
  };
  const serverMessage = candidate.response?.data?.message;
  const serverError = candidate.response?.data?.error;
  return (
    (typeof serverMessage === "string" && serverMessage) ||
    (typeof serverError === "string" && serverError) ||
    (typeof candidate.message === "string" && candidate.message) ||
    "Recent activity is unavailable right now."
  );
}

/** Fetch the admin-only recent activity feed. The server enforces admin authorization. */
export async function fetchRecentEvents(
  limit = 25,
  options: FetchRecentEventsOptions = {}
): Promise<RecentEventsResponse> {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit) || 25, 1), MAX_RECENT_EVENTS_LIMIT);

  try {
    const response = await axiosInstance.get(RECENT_EVENTS_PATH, {
      params: {
        limit: boundedLimit,
        ...(options.cursor ? { cursor: options.cursor } : {}),
        ...(options.since ? { since: options.since } : {}),
      },
      signal: options.signal,
      timeout: RECENT_EVENTS_TIMEOUT_MS,
      retryOnServerError: true,
    });
    return normaliseResponse(response.data);
  } catch (error: unknown) {
    const candidate = error as {
      code?: string;
      name?: string;
      response?: { status?: number };
    };
    if (candidate.code === "ERR_CANCELED" || candidate.name === "CanceledError") throw error;
    throw new RecentEventsError(errorMessage(error), candidate.response?.status ?? null);
  }
}

export { normaliseResponse };
