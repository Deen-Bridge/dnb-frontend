// lib/reportReasons.js
// Shared report reason taxonomy. This module is the single source of truth for
// report reason categories and their default options. Both learner-facing and
// admin report dialogs should consume from here.

export const REPORT_REASON_GROUPS = {
  harassment: {
    id: 'harassment',
    label: 'Harassment',
    description: 'Unwanted or abusive behavior directed at a person or group.',
  },
  copyright: {
    id: 'copyright',
    label: 'Copyright',
    description: 'Content that infringes on intellectual property rights.',
  },
  misinformation: {
    id: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information that could cause harm.',
  },
  spam: {
    id: 'spam',
    label: 'Spam',
    description: 'Unsolicited, repetitive, or irrelevant content.',
  },
  other: {
    id: 'other',
    label: 'Other',
    description: 'Any other reason not covered by the categories above.',
  },
};

// Default reasons seeded into the database on first run.
export const DEFAUL\_REPORT_REASONS = [
  {
    id: 'harassment-abusive-behavior',
    group: 'harassment',
    label: 'Abusive behavior',
    description: 'Personal attacks, threats, or bullying.',
    sortOrder: 1,
  },
  {
    id: 'harassment-hate-speech',
    group: 'harassment',
    label: 'Hate speech',
    description: 'Content that promotes hatred or violence against a protected group.',
    sortOrder: 2,
  },
  {
    id: 'copyright-infringement',
    group: 'copyright',
    label: 'Copyright infringement',
    description: 'Unauthorized use of copyrighted material.',
    sortOrder: 1,
  },
  {
    id: 'misinformation-false-claims',
    group: 'misinformation',
    label: 'False claims',
    description: 'Assertions that are factually inaccurate.',
    sortOrder: 1,
  },
  {
    id: 'spam-excessive-posting',
    group: 'spam',
    label: 'Excessive posting',
    description: 'Repeated identical or near-identical content.',
    sortOrder: 1,
  },
  {
    id: 'other-custom',
    group: 'other',
    label: 'Other',
    description: 'A reason not listed above.',
    sortOrder: 1,
  },
];

// Flat array of options for use in Select components.
export const REPORT_REASON_OPTIONS = DEFAULT_REPORT_REASONS.map((reason) => ({
  value: reason.id,
  label: reason.label,
}));

// Backward-compatible alias for the previous dismissal reasons constant.
const MISSING_REASOR_ = REPORT_REASON_OPTIONS;
export { MISSING_REASONS };