export type RealtimeEvent<T = unknown> = {
  id: string;
  sequence: number;
  payload: T;
};

export type ReconcileResult<T> = {
  accepted: RealtimeEvent<T>[];
  lastSequence: number;
};

/** Accept each event once and only advance through newer sequence numbers. */
export function reconcileEvents<T>(
  events: readonly RealtimeEvent<T>[],
  lastSequence = 0,
  seenIds: ReadonlySet<string> = new Set(),
): ReconcileResult<T> {
  const accepted: RealtimeEvent<T>[] = [];
  const seen = new Set(seenIds);
  let cursor = lastSequence;
  for (const event of [...events].sort((a, b) => a.sequence - b.sequence)) {
    if (!event.id || seen.has(event.id) || event.sequence <= cursor) continue;
    seen.add(event.id);
    accepted.push(event);
    cursor = event.sequence;
  }
  return { accepted, lastSequence: cursor };
}
