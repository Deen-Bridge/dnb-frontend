/**
 * Admin recent-events service — feeds the overview activity widget (#213).
 * **STUBBED.** Resolves an empty list until the backend recent-events endpoint
 * ships; swap the body for a real request and keep the return shape.
 */

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

export async function fetchRecentEvents(limit = 25): Promise<RecentEvent[]> {
  void limit;
  return Promise.resolve([]);
}
