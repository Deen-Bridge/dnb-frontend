const SAFE_ID = /^[A-Za-z0-9_-]{1,160}$/;

export function notificationPath(data: Record<string, unknown> = {}): string | null {
  const routes: Array<[string, string]> = [
    ["courseId", "/dashboard/courses/"],
    ["bookId", "/dashboard/library/"],
    ["spaceId", "/dashboard/spaces/"],
  ];
  for (const [key, prefix] of routes) {
    const value = data[key];
    if (typeof value === "string" && SAFE_ID.test(value)) return `${prefix}${encodeURIComponent(value)}`;
  }
  if (typeof data.reelId === "string" && SAFE_ID.test(data.reelId)) return "/dashboard/reels";
  return null;
}
