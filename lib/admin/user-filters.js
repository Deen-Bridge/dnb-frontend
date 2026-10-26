export const USER_ROLES = ["student", "mentor", "admin"];
export const USER_STATUSES = ["active", "suspended", "banned"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse URLSearchParams-like input into a normalized filter object. */
export function parseUserFilters(searchParams) {
  const get = (key) => searchParams?.get?.(key) ?? "";
  const role = get("role");
  const status = get("status");
  const from = get("from");
  const to = get("to");
  return {
    q: get("q").trim(),
    role: USER_ROLES.includes(role) ? role : "",
    status: USER_STATUSES.includes(status) ? status : "",
    from: DATE_RE.test(from) ? from : "",
    to: DATE_RE.test(to) ? to : "",
  };
}

/** Serialize filters to URLSearchParams, omitting empty values. */
export function serializeUserFilters(filters) {
  const params = new URLSearchParams();
  for (const key of ["q", "role", "status", "from", "to"]) {
    const value = (filters?.[key] ?? "").toString().trim();
    if (value) params.set(key, value);
  }
  return params;
}

/** Map filters to backend query params. */
export function toApiParams(filters) {
  const params = {};
  if (filters.q) params.search = filters.q;
  if (filters.role) params.role = filters.role;
  if (filters.status) params.status = filters.status;
  if (filters.from) params.createdFrom = filters.from;
  if (filters.to) params.createdTo = filters.to;
  return params;
}

const LABELS = { q: "Search", role: "Role", status: "Status", from: "From", to: "To" };

/** Active filter chips: [{ key, label }]. */
export function getActiveChips(filters) {
  return Object.keys(LABELS)
    .filter((key) => filters[key])
    .map((key) => ({ key, label: `${LABELS[key]}: ${filters[key]}` }));
}
