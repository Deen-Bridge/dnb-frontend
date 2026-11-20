import { DEFAULT_REPORT_REASONS } from "./reportReasons";

const reasons = new Map(
  DEFAULT_REPORT_REASONS.map((reason) => [reason.id, { ...reason }])
);

export function getReasons() {
  return [...reasons.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getReasonById(id) {
  return reasons.get(id) || null;
}

export function createReason({ group, label, description = "" }) {
  const id = `${group}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const reason = { id, group, label, description, sortOrder: getReasons().length + 1 };
  reasons.set(id, reason);
  return reason;
}

export function updateReason(id, updates) {
  const existing = getReasonById(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, id };
  reasons.set(id, updated);
  return updated;
}

export function mergeReason(id, mergeInto) {
  if (!getReasonById(id) || !getReasonById(mergeInto) || id === mergeInto) return null;
  reasons.delete(id);
  return { merged: id, into: mergeInto };
}
