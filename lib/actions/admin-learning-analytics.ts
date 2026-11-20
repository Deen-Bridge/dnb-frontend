export interface AnalyticsMetric {
  label: string;
  value: number;
  tracked: boolean;
}

export interface FunnelStage {
  stage: string;
  label: string;
  value: number;
  tracked: boolean;
}

export interface BucketValue {
  range: string;
  value: number;
}

export interface CountryEngagement {
  code: string;
  name: string;
  learners: number;
  revenue: number;
  tracked: boolean;
}

export interface EngagementAnalyticsOptions {
  /** ISO date string for the start of the range. */
  from?: string;
  /** ISO date string for the end of the range. */
  to?: string;
}

export interface EngagementAnalyticsResult {
  generatedAt: string;
  totals: {
    students: AnalyticsMetric;
    coursesEnrolled: AnalyticsMetric;
    lessonsCompleted: AnalyticsMetric;
    avgSessionLength: AnalyticsMetric;
  };
  funnel: FunnelStage[];
  sessionLength: { tracked: boolean; avgMinutes: number | null };
  lessonsCompleted: { tracked: boolean; buckets: BucketValue[] };
  readingDepth: { tracked: boolean; buckets: BucketValue[] };
  geographic: {
    tracked: boolean;
    coverage: AnalyticsMetric;
    countries: CountryEngagement[];
  };
}

// Keep in sync with admin-learning-analytics.js (the app resolves the .js twin;
// vitest prefers this .ts one).
export async function fetchEngagementAnalytics(
  _options: EngagementAnalyticsOptions = {},
): Promise<EngagementAnalyticsResult> {
  return Promise.resolve({
    generatedAt: new Date().toISOString(),
    totals: {
      students: { label: "Total Students", value: 842, tracked: true },
      coursesEnrolled: { label: "Courses Enrolled", value: 1284, tracked: true },
      lessonsCompleted: { label: "Lessons Completed", value: 0, tracked: false },
      avgSessionLength: { label: "Avg. Session Length", value: 0, tracked: false },
    },
    funnel: [
      { stage: "enrolled", label: "Enrolled", value: 1284, tracked: true },
      { stage: "started", label: "Started", value: 0, tracked: false },
      { stage: "quarter", label: "25% Complete", value: 0, tracked: false },
      { stage: "completed", label: "Completed", value: 0, tracked: false },
    ],
    sessionLength: { tracked: false, avgMinutes: null },
    lessonsCompleted: {
      tracked: false,
      buckets: [
        { range: "1–5", value: 0 },
        { range: "6–10", value: 0 },
        { range: "11–20", value: 0 },
        { range: "21–40", value: 0 },
        { range: "41+", value: 0 },
      ],
    },
    readingDepth: {
      tracked: false,
      buckets: [
        { range: "0–25%", value: 0 },
        { range: "26–50%", value: 0 },
        { range: "51–75%", value: 0 },
        { range: "76–100%", value: 0 },
      ],
    },
    geographic: {
      tracked: true,
      coverage: { label: "Country Data Coverage", value: 68, tracked: true },
      countries: [
        { code: "US", name: "United States", learners: 214, revenue: 12840, tracked: true },
        { code: "GB", name: "United Kingdom", learners: 156, revenue: 9360, tracked: true },
        { code: "SA", name: "Saudi Arabia", learners: 132, revenue: 7920, tracked: true },
        { code: "AE", name: "United Arab Emirates", learners: 98, revenue: 5880, tracked: true },
        { code: "MY", name: "Malaysia", learners: 84, revenue: 5040, tracked: true },
        { code: "ID", name: "Indonesia", learners: 71, revenue: 4260, tracked: true },
        { code: "EG", name: "Egypt", learners: 52, revenue: 3120, tracked: true },
        { code: "PK", name: "Pakistan", learners: 35, revenue: 2100, tracked: true },
      ],
    },
  });
}
