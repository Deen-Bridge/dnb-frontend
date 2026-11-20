/**
 * Normalize the different response shapes returned by profile collection APIs.
 * Public profile pages should render an empty state for a valid empty response,
 * rather than treating a missing nested property as a loading state forever.
 */
export function normalizeProfileCollection(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  return [];
}

export function profileEmptyMessage(title) {
  return `No ${title} yet. Stay tuned!`;
}
