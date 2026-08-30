export interface SlaBucket {
  key: "healthy" | "watch" | "overdue";
  label: string;
  shortLabel: string;
  minAgeDays?: number;
  maxAgeDays?: number;
  badgeClass: string;
  dotClass: string;
  iconClass: string;
}

export const VERIFICATION_SLA_BUCKETS: Record<"healthy" | "watch" | "overdue", SlaBucket> = {
  healthy: {
    key: "healthy",
    label: "Under 3 days",
    shortLabel: "Healthy",
    maxAgeDays: 2,
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    dotClass: "bg-green-500",
    iconClass: "text-green-500",
  },
  watch: {
    key: "watch",
    label: "3-7 days",
    shortLabel: "Watch",
    minAgeDays: 3,
    maxAgeDays: 7,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
    iconClass: "text-amber-500",
  },
  overdue: {
    key: "overdue",
    label: "Beyond 7 days",
    shortLabel: "Escalate",
    minAgeDays: 8,
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    dotClass: "bg-red-500",
    iconClass: "text-red-500",
  },
};

export const VERIFICATION_SLA_BUCKET_ORDER = ["healthy", "watch", "overdue"] as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getVerificationAgeDays(submittedAt: string | Date | number, now: Date = new Date()): number {
  const submittedDate = new Date(submittedAt);
  if (Number.isNaN(submittedDate.getTime())) return 0;

  const elapsed = now.getTime() - submittedDate.getTime();
  return Math.max(0, Math.floor(elapsed / DAY_IN_MS));
}

export function getVerificationSlaBucket(submittedAt: string | Date | number, now: Date = new Date()): SlaBucket {
  const ageDays = getVerificationAgeDays(submittedAt, now);

  if (ageDays <= (VERIFICATION_SLA_BUCKETS.healthy.maxAgeDays ?? 2)) {
    return VERIFICATION_SLA_BUCKETS.healthy;
  }

  if (ageDays <= (VERIFICATION_SLA_BUCKETS.watch.maxAgeDays ?? 7)) {
    return VERIFICATION_SLA_BUCKETS.watch;
  }

  return VERIFICATION_SLA_BUCKETS.overdue;
}

export interface VerificationQueueItem {
  submittedAt: string | Date | number;
  [key: string]: any; // TODO(types): Verification queue item structure
}

export function countVerificationSlaBuckets(
  queue: VerificationQueueItem[],
  now: Date = new Date()
): Record<"healthy" | "watch" | "overdue", number> {
  return queue.reduce(
    (counts, item) => {
      const bucket = getVerificationSlaBucket(item.submittedAt, now);
      return { ...counts, [bucket.key]: counts[bucket.key] + 1 };
    },
    { healthy: 0, watch: 0, overdue: 0 }
  );
}
