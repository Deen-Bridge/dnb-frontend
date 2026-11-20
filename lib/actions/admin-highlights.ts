import axiosInstance from "@/lib/config/axios.config";

export interface FeatureHighlight { id: string; title: string; description?: string; href?: string; enabled: boolean; priority: number; [key: string]: unknown; }
export interface CreateHighlightPayload { id?: string; title: string; description?: string; href?: string; enabled?: boolean; priority?: number; }
const endpoint = "/api/admin/highlights";
export async function listHighlights(): Promise<{ highlights: FeatureHighlight[] }> { const { data } = await axiosInstance.get(endpoint, { params: { enabled: true } }); return data; }
export async function listAllHighlights(): Promise<{ highlights: FeatureHighlight[] }> { const { data } = await axiosInstance.get(endpoint); return data; }
export async function createHighlight(payload: CreateHighlightPayload): Promise<{ highlight: FeatureHighlight }> { const { data } = await axiosInstance.post(endpoint, payload); return data; }
export async function updateHighlight(id: string, updates: Partial<Omit<FeatureHighlight, "id">>): Promise<{ highlight: FeatureHighlight }> { const { data } = await axiosInstance.patch(`${endpoint}/${encodeURIComponent(id)}`, updates); return data; }
export async function deleteHighlight(id: string): Promise<{ success: boolean }> { const { data } = await axiosInstance.delete(`${endpoint}/${encodeURIComponent(id)}`); return data; }
export async function toggleHighlight(id: string, enabled: boolean): Promise<{ highlight: FeatureHighlight }> { return updateHighlight(id, { enabled }); }
export async function reorderHighlights(order: Array<{ id: string; priority: number }>): Promise<{ success: boolean }> { const { data } = await axiosInstance.post(`${endpoint}/reorder`, { order }); return data; }
export async function validateSelector(selector: string): Promise<{ valid: boolean; error?: string }> { const { data } = await axiosInstance.post(`${endpoint}/validate-selector`, { selector }); return data; }
