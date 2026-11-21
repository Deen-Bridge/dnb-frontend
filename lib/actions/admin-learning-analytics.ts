import axiosInstance from "@/lib/config/axios.config";

export const DEFAULT_ANALYTICS_RANGE_DAYS = 90;
export const MAX_ANALYTICS_RANGE_DAYS = 365;

export interface AnalyticsMetric { label: string; value: number | null; tracked: boolean }
export interface FunnelStage { stage: string; label: string; value: number; tracked: boolean }
export interface BucketValue { range: string; value: number }
export interface CountryEngagement { code: string; name: string; learners: number; revenue: number; tracked: boolean }
export interface EngagementAnalyticsOptions { from?: string; to?: string }
export interface EngagementAnalyticsResult {
  generatedAt: string;
  freshness?: string;
  dateRange: { from: string; to: string };
  totals: { students: AnalyticsMetric; coursesEnrolled: AnalyticsMetric; lessonsCompleted: AnalyticsMetric; avgSessionLength: AnalyticsMetric };
  funnel: FunnelStage[];
  sessionLength: { tracked: boolean; avgMinutes: number | null };
  lessonsCompleted: { tracked: boolean; buckets: BucketValue[] };
  readingDepth: { tracked: boolean; buckets: BucketValue[] };
  geographic: { tracked: boolean; coverage: AnalyticsMetric; countries: CountryEngagement[] };
}

export function normalizeAnalyticsRange({ from, to }: EngagementAnalyticsOptions = {}) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - DEFAULT_ANALYTICS_RANGE_DAYS * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("from must be a valid ISO-8601 date");
  if (start > end) throw new Error("from must be earlier than or equal to to");
  if ((end.getTime() - start.getTime()) / 86400000 > MAX_ANALYTICS_RANGE_DAYS) throw new Error(`Learning analytics date range cannot exceed ${MAX_ANALYTICS_RANGE_DAYS} days`);
  return { from: start.toISOString(), to: end.toISOString(), timezone: "UTC" };
}

const metric = (label: string, value?: number | null, tracked = false): AnalyticsMetric => ({
  label,
  value: value ?? null,
  tracked: Boolean(tracked && value != null),
});

export function normalizeAnalyticsResult(payload: Partial<EngagementAnalyticsResult>, range: ReturnType<typeof normalizeAnalyticsRange>): EngagementAnalyticsResult {
  return {
    generatedAt: payload.generatedAt ?? new Date().toISOString(),
    freshness: payload.freshness,
    dateRange: payload.dateRange ?? { from: range.from, to: range.to },
    totals: {
      students: payload.totals?.students ?? metric("Total Students"),
      coursesEnrolled: payload.totals?.coursesEnrolled ?? metric("Courses Enrolled"),
      lessonsCompleted: payload.totals?.lessonsCompleted ?? metric("Lessons Completed"),
      avgSessionLength: payload.totals?.avgSessionLength ?? metric("Avg. Session Length"),
    },
    funnel: payload.funnel ?? [],
    sessionLength: payload.sessionLength ?? { tracked: false, avgMinutes: null },
    lessonsCompleted: payload.lessonsCompleted ?? { tracked: false, buckets: [] },
    readingDepth: payload.readingDepth ?? { tracked: false, buckets: [] },
    geographic: payload.geographic ?? { tracked: false, coverage: metric("Country Data Coverage"), countries: [] },
  };
}

export async function fetchEngagementAnalytics(options: EngagementAnalyticsOptions = {}): Promise<EngagementAnalyticsResult> {
  const range = normalizeAnalyticsRange(options);
  const response = await axiosInstance.get("/api/admin/analytics/engagement", { params: range });
  return normalizeAnalyticsResult(response.data?.data ?? response.data, range);
}
