/**
 * Admin announcement analytics — reach and engagement (#305).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves representative per-announcement stats so the admin
 * announcements analytics can be built and reviewed before the backend
 * tracking endpoints ship.
 *
 * The stub follows the learning-analytics convention (#322): every metric
 * carries an explicit `tracked` flag. Metrics the platform does not instrument
 * yet (e.g. embedded-link clicks) resolve with `tracked: false` so the UI
 * renders an explicit "not tracked yet" gap instead of a silent zero.
 * Dismiss rate is *calculated* from dismissals / impressions so the formula is
 * in place the moment the underlying events exist.
 *
 * TODO(backend): GET /api/admin/announcements/analytics?from=&to=
 *   - Auth: requires an admin session token (server-side tier check).
 *   - 200 → { generatedAt, range, totals, announcements } as documented below.
 *
 * ### Proposed event names (backend alignment)
 *
 * Minimal, flat, `noun.verb` event names so the backend can instrument the
 * same pipeline the UI renders:
 *
 *   announcement.impression   — fired each time the announcement is shown to a
 *                               user (feeds `impressions`; client-side dedupe
 *                               is NOT applied here)
 *   announcement.view         — fired when the announcement is actually viewed
 *                               (feeds `uniqueViewers`; backend dedupes by
 *                               viewer id per announcement)
 *   announcement.dismiss      — fired when the user dismisses/closes the
 *                               announcement (feeds `dismissals`; rate =
 *                               dismissals / impressions)
 *   announcement.link_click   — fired when the user clicks an embedded link
 *                               (feeds `linkClicks`; rate = clicks /
 *                               impressions) — NOT instrumented yet, so the
 *                               UI shows an honest gap
 *
 * Analytics shape:
 *   {
 *     generatedAt: string,
 *     range: { from?: string, to?: string },
 *     totals: {
 *       impressions:    { label, value, tracked },
 *       uniqueViewers:  { label, value, tracked },
 *       dismissRate:    { label, value, tracked, unit: "percent" },
 *       ctr:            { label, value, tracked, unit: "percent" },
 *     },
 *     announcements: [{
 *       id, title, sentAt,
 *       impressions:   { value, tracked },
 *       uniqueViewers: { value, tracked },
 *       dismissRate:   { value, tracked, unit: "percent" },
 *       ctr:           { value, tracked, unit: "percent" },
 *     }],
 *   }
 */

const MOCK_DELAY_MS = 300;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Minimal flat event names — shared with the backend team for alignment. */
export const ANNOUNCEMENT_EVENT_NAMES = Object.freeze({
  impression: "announcement.impression",
  view: "announcement.view",
  dismiss: "announcement.dismiss",
  linkClick: "announcement.link_click",
});

/** Turns raw counts into a percent value, or null when counts are absent. */
function percent(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

/**
 * Fetch per-announcement reach and engagement statistics for a date range.
 *
 * TODO(backend):
 *   return axiosInstance
 *     .get("/api/admin/announcements/analytics", { params: { from, to } })
 *     .then((res) => res.data);
 *
 * @param {{ from?: string, to?: string }} [range] optional ISO date bounds.
 * @returns {Promise<object>} the analytics shape documented above.
 */
export async function fetchAnnouncementAnalytics({ from, to } = {}) {
  const announcements = [
    {
      id: "ann_001",
      title: "New course: Seerah of the Prophet",
      sentAt: "2026-08-21T09:00:00.000Z",
      impressions: { value: 3421, tracked: true },
      uniqueViewers: { value: 1987, tracked: true },
      dismissals: { value: 718, tracked: true },
      linkClicks: { value: null, tracked: false },
    },
    {
      id: "ann_002",
      title: "Library update: 40 new books",
      sentAt: "2026-08-18T10:30:00.000Z",
      impressions: { value: 2864, tracked: true },
      uniqueViewers: { value: 1750, tracked: true },
      dismissals: { value: 429, tracked: true },
      linkClicks: { value: null, tracked: false },
    },
    {
      id: "ann_003",
      title: "Live spaces launch",
      sentAt: "2026-08-14T08:00:00.000Z",
      impressions: { value: 5120, tracked: true },
      uniqueViewers: { value: 2934, tracked: true },
      dismissals: { value: 1485, tracked: true },
      linkClicks: { value: null, tracked: false },
    },
  ];

  const withRates = announcements.map((ann) => ({
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
      value: ann.linkClicks.tracked ? percent(ann.linkClicks.value, ann.impressions.value) : 0,
      tracked: ann.linkClicks.tracked && ann.impressions.tracked,
      unit: "percent",
    },
  }));

  const sum = (pick) =>
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
