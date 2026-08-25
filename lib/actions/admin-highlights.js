/**
 * Admin Feature Highlights Actions (#304)
 * ----------------------------------------
 * Server actions for managing feature highlight definitions.
 * These are called by the admin interface to CRUD highlights.
 *
 * NOTE: Currently stubbed for development. Replace with actual
 * API calls when the backend endpoint is available.
 */

// Simulated in-memory store for development
let mockHighlights = [
  {
    id: "welcome-ai-chat",
    selector: "[data-feature='ai-chat']",
    title: "New: AI Assistant",
    message: "Ask our AI assistant any Islamic question. It provides scholarly answers with citations.",
    placement: "bottom",
    priority: 10,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stellar-payments",
    selector: "[data-feature='stellar-wallet']",
    title: "Stellar Payments",
    message: "Support educators directly using Stellar blockchain payments.",
    placement: "left",
    priority: 5,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * List all feature highlights
 * @returns {Promise<{ highlights: Array }>}
 */
export async function listHighlights() {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE}/admin/feature-highlights`);
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlights: mockHighlights.filter((h) => h.enabled) };
}

/**
 * List all feature highlights (including disabled) for admin
 * @returns {Promise<{ highlights: Array }>}
 */
export async function listAllHighlights() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlights: [...mockHighlights] };
}

/**
 * Create a new feature highlight
 * @param {Object} payload
 * @param {string} payload.id - Unique identifier
 * @param {string} payload.selector - CSS selector
 * @param {string} payload.message - Tooltip message
 * @param {string} [payload.title] - Optional title
 * @param {string} [payload.placement] - Tooltip placement
 * @param {number} [payload.priority] - Display priority
 * @returns {Promise<{ highlight: Object }>}
 */
export async function createHighlight(payload) {
  // Validate required fields
  if (!payload.id || !payload.selector || !payload.message) {
    throw new Error("Missing required fields: id, selector, message");
  }

  // Check for duplicate ID
  if (mockHighlights.some((h) => h.id === payload.id)) {
    throw new Error(`Highlight with ID "${payload.id}" already exists`);
  }

  const highlight = {
    id: payload.id,
    selector: payload.selector,
    message: payload.message,
    title: payload.title || null,
    placement: payload.placement || "bottom",
    priority: payload.priority || 0,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  mockHighlights.push(highlight);

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlight };
}

/**
 * Update an existing feature highlight
 * @param {string} id - Highlight ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{ highlight: Object }>}
 */
export async function updateHighlight(id, updates) {
  const index = mockHighlights.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error(`Highlight "${id}" not found`);
  }

  // Don't allow changing the ID
  const { id: _ignoredId, ...safeUpdates } = updates;

  mockHighlights[index] = {
    ...mockHighlights[index],
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlight: mockHighlights[index] };
}

/**
 * Delete a feature highlight
 * @param {string} id - Highlight ID
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteHighlight(id) {
  const index = mockHighlights.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error(`Highlight "${id}" not found`);
  }

  mockHighlights.splice(index, 1);

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true };
}

/**
 * Toggle a highlight's enabled state
 * @param {string} id - Highlight ID
 * @param {boolean} enabled - New enabled state
 * @returns {Promise<{ highlight: Object }>}
 */
export async function toggleHighlight(id, enabled) {
  return updateHighlight(id, { enabled });
}

/**
 * Reorder highlights by priority
 * @param {Array<{ id: string, priority: number }>} order
 * @returns {Promise<{ success: boolean }>}
 */
export async function reorderHighlights(order) {
  for (const item of order) {
    const highlight = mockHighlights.find((h) => h.id === item.id);
    if (highlight) {
      highlight.priority = item.priority;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true };
}

/**
 * Validate a CSS selector
 * @param {string} selector
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validateSelector(selector) {
  try {
    // Basic validation - check if it's a valid CSS selector syntax
    if (typeof document !== "undefined") {
      document.querySelector(selector);
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
