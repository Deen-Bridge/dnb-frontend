export interface FeatureHighlight {
  id: string;
  selector: string;
  title: string | null;
  message: string;
  placement: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

let mockHighlights: FeatureHighlight[] = [
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

export async function listHighlights(): Promise<{ highlights: FeatureHighlight[] }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlights: mockHighlights.filter((h) => h.enabled) };
}

export async function listAllHighlights(): Promise<{ highlights: FeatureHighlight[] }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlights: [...mockHighlights] };
}

export interface CreateHighlightPayload {
  id: string;
  selector: string;
  message: string;
  title?: string | null;
  placement?: string;
  priority?: number;
}

export async function createHighlight(payload: CreateHighlightPayload): Promise<{ highlight: FeatureHighlight }> {
  if (!payload.id || !payload.selector || !payload.message) {
    throw new Error("Missing required fields: id, selector, message");
  }

  if (mockHighlights.some((h) => h.id === payload.id)) {
    throw new Error(`Highlight with ID "${payload.id}" already exists`);
  }

  const highlight: FeatureHighlight = {
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

export async function updateHighlight(id: string, updates: Partial<Omit<FeatureHighlight, "id">>): Promise<{ highlight: FeatureHighlight }> {
  const index = mockHighlights.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error(`Highlight "${id}" not found`);
  }

  const { ...safeUpdates } = updates;

  mockHighlights[index] = {
    ...mockHighlights[index],
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { highlight: mockHighlights[index] };
}

export async function deleteHighlight(id: string): Promise<{ success: boolean }> {
  const index = mockHighlights.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error(`Highlight "${id}" not found`);
  }

  mockHighlights.splice(index, 1);

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true };
}

export async function toggleHighlight(id: string, enabled: boolean): Promise<{ highlight: FeatureHighlight }> {
  return updateHighlight(id, { enabled });
}

export async function reorderHighlights(order: Array<{ id: string; priority: number }>): Promise<{ success: boolean }> {
  for (const item of order) {
    const highlight = mockHighlights.find((h) => h.id === item.id);
    if (highlight) {
      highlight.priority = item.priority;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true };
}

export async function validateSelector(selector: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (typeof document !== "undefined") {
      document.querySelector(selector);
    }
    return { valid: true };
  } catch (error: any) { // TODO(types): DOMException from querySelector
    return { valid: false, error: error?.message || "Invalid selector" };
  }
}
