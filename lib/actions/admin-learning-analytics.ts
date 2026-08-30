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
}

export async function fetchEngagementAnalytics(): Promise<EngagementAnalyticsResult> {
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
  });
}
