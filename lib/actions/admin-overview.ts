/**
 * Admin overview service — platform snapshot for the overview home page (#339).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves a representative snapshot so the admin overview /
 * empty-database bootstrap experience can be built and reviewed before the
 * backend endpoints ship.
 */

export interface OverviewMetricCount {
  label: string;
  value: number;
}

export interface OverviewSettingItem {
  label: string;
  configured: boolean;
}

export interface AdminOverviewSnapshot {
  generatedAt: string;
  empty: boolean;
  counts: {
    mentors: OverviewMetricCount;
    categories: OverviewMetricCount;
    courses: OverviewMetricCount;
    books: OverviewMetricCount;
    students: OverviewMetricCount;
    transactions: OverviewMetricCount;
    [key: string]: OverviewMetricCount;
  };
  settings: {
    platformName: OverviewSettingItem;
    paymentSettings: OverviewSettingItem;
    [key: string]: OverviewSettingItem;
  };
}

function withResolved<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

/**
 * Fetch the platform-wide overview snapshot.
 */
export async function fetchAdminOverview(): Promise<AdminOverviewSnapshot> {
  return withResolved({
    generatedAt: new Date().toISOString(),
    empty: true,
    counts: {
      mentors: { label: "Mentors", value: 0 },
      categories: { label: "Categories", value: 0 },
      courses: { label: "Courses", value: 0 },
      books: { label: "Books", value: 0 },
      students: { label: "Students", value: 0 },
      transactions: { label: "Transactions", value: 0 },
    },
    settings: {
      platformName: { label: "Platform name", configured: false },
      paymentSettings: { label: "Payment settings", configured: false },
    },
  });
}
