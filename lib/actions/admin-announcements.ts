/**
 * Admin announcement analytics — reach and engagement (#305).
 */

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export const ANNOUNCEMENT_EVENT_NAMES = Object.freeze({
  impression: "announcement.impression",
  view: "announcement.view",
  dismiss: "announcement.dismiss",
  linkClick: "announcement.link_click",
} as const);

export type AnnouncementEventName = typeof ANNOUNCEMENT_EVENT_NAMES[keyof typeof ANNOUNCEMENT_EVENT_NAMES];

function percent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

export interface MetricValue {
  label?: string;
  value: number | null;
  tracked: boolean;
  unit?: string;
}

export interface AnnouncementItemAnalytics {
  id: string;
  title: string;
  sentAt: string;
  impressions: MetricValue;
  uniqueViewers: MetricValue;
  dismissRate: MetricValue;
  ctr: MetricValue;
}

export interface AnnouncementAnalyticsTotals {
  impressions: MetricValue;
  uniqueViewers: MetricValue;
  dismissRate: MetricValue;
  ctr: MetricValue;
}

export interface AnnouncementAnalyticsResult {
  generatedAt: string;
  range: {
    from: string | null;
    to: string | null;
  };
  totals: AnnouncementAnalyticsTotals;
  announcements: AnnouncementItemAnalytics[];
}

export interface FetchAnnouncementAnalyticsOptions {
  from?: string;
  to?: string;
}

export async function fetchAnnouncementAnalytics({
  from,
  to,
}: FetchAnnouncementAnalyticsOptions = {}): Promise<AnnouncementAnalyticsResult> {
  const announcements = [
    {
      id: "ann_001",
      title: "New course: Seerah of the Prophet",
      sentAt: "2026-08-21T09:00:00.000Z",
      impressions: { value: 3421, tracked: true },
      uniqueViewers: { value: 1987, tracked: true },
      dismissals: { value: 718, tracked: true },
      linkClicks: { value: null as number | null, tracked: false },
    },
    {
      id: "ann_002",
      title: "Library update: 40 new books",
      sentAt: "2026-08-18T10:30:00.000Z",
      impressions: { value: 2864, tracked: true },
      uniqueViewers: { value: 1750, tracked: true },
      dismissals: { value: 429, tracked: true },
      linkClicks: { value: null as number | null, tracked: false },
    },
    {
      id: "ann_003",
      title: "Live spaces launch",
      sentAt: "2026-08-14T08:00:00.000Z",
      impressions: { value: 5120, tracked: true },
      uniqueViewers: { value: 2934, tracked: true },
      dismissals: { value: 1485, tracked: true },
      linkClicks: { value: null as number | null, tracked: false },
    },
  ];

  const withRates: AnnouncementItemAnalytics[] = announcements.map((ann) => ({
    id: ann.id,
    title: ann.title,
    sentAt: ann.sentAt,
    impressions: { value: ann.impressions.value, tracked: ann.impressions.tracked },
    uniqueViewers: { value: ann.uniqueViewers.value, tracked: ann.uniqueViewers.tracked },
    dismissRate: {
      value: ann.dismissals.tracked ? percent(ann.dismissals.value, ann.impressions.value) : 0,
      tracked: ann.dismissals.tracked && ann.impressions.tracked,
      unit: "percent",
    },
    ctr: {
      value: (ann.linkClicks.tracked && ann.linkClicks.value !== null) ? percent(ann.linkClicks.value, ann.impressions.value) : 0,
      tracked: ann.linkClicks.tracked && ann.impressions.tracked,
      unit: "percent",
    },
  }));

  const sum = (pick: (a: typeof announcements[number]) => number | null | undefined) =>
    announcements.reduce((total, ann) => total + (pick(ann) || 0), 0);

  const totalImpressions = sum((a) => a.impressions.value);
  const totalViewers = sum((a) => a.uniqueViewers.value);
  const totalDismissals = sum((a) => (a.dismissals.tracked ? a.dismissals.value : 0));
  const totalClicks = sum((a) => (a.linkClicks.tracked ? a.linkClicks.value : 0));

  return withMockDelay({
    generatedAt: new Date().toISOString(),
    range: { from: from || null, to: to || null },
    totals: {
      impressions: { label: "Impressions", value: totalImpressions, tracked: true },
      uniqueViewers: { label: "Unique Viewers", value: totalViewers, tracked: true },
      dismissRate: {
        label: "Dismiss Rate",
        value: percent(totalDismissals, totalImpressions),
        tracked: true,
        unit: "percent",
      },
      ctr: {
        label: "Click-through Rate",
        value: percent(totalClicks, totalImpressions),
        tracked: false,
        unit: "percent",
      },
    },
    announcements: withRates,
  });
}
