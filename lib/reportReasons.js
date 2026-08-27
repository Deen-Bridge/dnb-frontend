/**
 * reportReasons.js -- Centralized reason taxonomy for reports.
 *
 * This module serves as the single source of truth for report reason
 * categories, descriptions, and ordering across both learner-facing and
 * admin-facing report dialogs.
 *
 * It provides:
 *  - Grouped report reason categories (harassment, copyright, misinformation,
 *    spam, other) with descriptions.
 *  - CRUD operations for reasons (create, edit, merge, delete) and ordering
 *    controls.
 *  - Historical data preservation when reasons are merged via redirects.
 */

// --------------------------------------------------------------------------------------
// Default taxonomy
// --------------------------------------------------------------------------------------

const DEFAULT_REASON_GROUPS = [
  {
    id: 'harassment',
    label: 'Harassment',
    description: 'Content that is threatening, abusive, or demeaning.',
    reasons: [
      { value: 'abusive_language', label: 'Abusive language' },
      { value: 'targeted_harassment', label: 'Targeted harassment' },
      { value: 'hate_speech', label: 'Hate speech' },
    ],
  },
  {
    id: 'copyright',
    label: 'Copyright',
    description: 'Content that infringes on intellectual property rights.',
    reasons: [
      { value: 'copyright_infringement', label: 'Copyright infringement' },
      { value: 'plagiarism', label: 'Plagiarism' },
    ],
  },
  {
    id: 'misinformation',
    label: 'Misinformation',
    description: 'Content that is false or misleading.',
    reasons: [
      { value: 'false_information', label: 'False information' },
      { value: 'misleading_claims', label: 'Misleading claims' },
    ],
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'Unsolicited or irrelevant content.',
    reasons: [
      { value: 'unsolicited_promotion', label: 'Unsolicited promotion' },
      { value: 'repeated_messages', label: 'Repeated messages' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Any other reason not covered above.',
    reasons: [
      { value: 'other', label: 'Other' },
    ],
  },
];

// --------------------------------------------------------------------------------------
// Mutable state (runtime modifications)
// --------------------------------------------------------------------------------------

let reasonGroups = DEFAULT_REASON_GROUPS.map(group => ({
  ...group,
  reasons: group.reasons.map(reason => ({ ...reason })),
}));

let reasonRedirects = {};

// --------------------------------------------------------------------------------------
// Helper functions (internal)
// -------------------------------------------------------------------------------------

function cloneGroups(groups) {
  return groups.map(group => ({
    ...group,
    reasons: group.reasons.map(reason => ({ ...reason })),
  }));
}

function flattenReasons(groups) {
  return groups.flatMap(group => group.reasons.map(({ value, label }) => ({ value, label })));
}

// --------------------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------------------

export function getReportReasonGroups() {
  return cloneGroups(reasonGroups);
}

export function getReportReasons() {
  return flattenReasons(reasonGroups);
}

export function getReasonLabel(value, resolveRedirect = true) {
  const target = resolveRedirect ? resolveReportReasonValue(value) : value;
  const reason = flattenReasons(reasonGroups).find(r => r.value === target);
  return reason?.label ?? target;
}

export function resolveReportReasonValue(value) {
  let current = value;
  const visited = new Set();
  while (reasonRedirects[current] && !visited.has(current)) {
    visited.add(current);
    current = reasonRedirects[current];
  }
  return current;
}

export function addReportReason(groupId, { value, label }) {
  if (!groupId || !value || !label) {
    return { success: false, error: 'Group ID, value, and label are required.' };
  }
  if (flattenReasons(reasonGroups).some(r => r.value === value)) {
    return { success: false, error: 'A reason with this value already exists.' };
  }
  const group = reasonGroups.find(g => g.id === groupId);
  if (!group) {
    return { success: false, error: `${groupId} group does not exist.`  };
  }
  group.reasons.push({ value, label });
  return { success: true };
}

export function editReportReason(value, { label, groupId } = {}) {
  let found = false;
  for (const group of reasonGroups) {
    const reason = group.reasons.find(r => r.value === value);
    if (reason) {
      if (label) reason.label = label;
      if (groupId && groupId !== group.id) {
        const destGroup = reasonGroups.find(g => g.id === groupId);
        if (!destGroup) {
          return { success: false, error: `Group "${groupId}" does not exist.` };
        }
        group.reasons = group.reasons.filter(r => r.value !== value);
        destGroup.reasons.push({ ...reason });
      }
      found = true;
      break;
    }
  }
  if (!found) {
    return { success: false, error: `Reason "${value}" does not exist.` };
  }
  return { success: true };
}

export function mergeReportReason(sourceValue, targetValue) {
  if (sourceValue === targetValue) {
    return { success: false, error: 'Source and target reasons cannot be the same.' };
  }
  if (!flattenReasons(reasonGroups).some(r => r.value === targetValue)) {
    return { success: false, error: `Target reason "${targetValue}" does not exist.` };
  }
  const sourceExists = flattenReasons(reasonGroups).some(r => r.value === sourceValue);
  if (sourceExists) {
    for (const group of reasonGroups) {
      group.reasons = group.reasons.filter(r => r.value !== sourceValue);
    }
  }
  for (const [oldVal, newVal] of Object.entries(reasonRedirects)) {
    if (newVal === sourceValue) {
      reasonRedirects[oldVal] = targetValue;
    }
  }
  reasonRedirects[sourceValue] = targetValue;
  return { success: true };
}

export function moveReportReason(value, direction) {
  for (const group of reasonGroups) {
    const idx = group.reasons.findIndex(r => r.value === value);
    if (idx === -1) continue;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= group.reasons.length) {
      return { success: false, error: 'Reason is already at the edge.' };
    }
    const [reason] = group.reasons.splice(idx, 1);
    group.reasons.splice(newIdx, 0, reason);
    return { success: true };
  }
  return { success: false, error: `Reason "${value}" not found.` };
}

export function reorderReportReasons(groupId, orderedValues) {
  const group = reasonGroups.find(g => g.id === groupId);
  if (!group) {
    return { success: false, error: `Group "${groupId}" does not exist.` };
  }
  const currentValues = group.reasons.map(r => r.value);
  if (currentValues.length !== orderedValues.length ||
      new Set(currentValues).size !== new Set(orderedValues).size ||
      !orderedValues.every(v => currentValues.includes(v))) {
    return { success: false, error: 'Ordered values must be a permutation of the current reason values.' };
  }
  const reasonMap = new Map(group.reasons.map(r => [r.value, r]));
  group.reasons = orderedValues.map(v => reasonMap.get(v));
  return { success: true };
}

export function deleteReportReason(value) {
  let found = false;
  for (const group of reasonGroups) {
    const before = group.reasons.length;
    group.reasons = group.reasons.filter(r => r.value !== value);
    if (group.reasons.length < before) found = true;
  }
  if (!found) {
    return { success: false, error: `Reason "${value}" not found.` };
  }
  for (const [oldVal, newVal] of Object.entries(reasonRedirects)) {
    if (newVal === value) {
      delete reasonRedirects[oldVal];
    }
  }
  return { success: true };
}
