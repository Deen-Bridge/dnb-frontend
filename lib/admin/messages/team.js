/**
 * @module lib/admin/messages/team
 * Admin team management strings (#344)
 * -------------------------------------------------------------------------
 * Strings for admin team pages: invitations, role changes, and access control.
 *
 * Placeholder conventions:
 *   {name}   → User's display name
 *   {email}  → User's email address
 *   {tier}   → Admin tier label (e.g., "Super admin", "Staff")
 *   {time}   → Relative time string (e.g., "2 hours ago")
 */

// Page header
export const PAGE_TITLE = "Admin team";
export const PAGE_SUBTITLE = "Manage admin access and role tiers across DeenBridge";

// Table headers
export const TABLE_HEADER_MEMBER = "Member";
export const TABLE_HEADER_TIER = "Tier";
export const TABLE_HEADER_LAST_ACTIVE = "Last active";
export const TABLE_HEADER_ADDED_BY = "Added by";
export const TABLE_HEADER_ACTIONS = "Actions";

// Tier labels
export const TIER_SUPER_ADMIN = "Super admin";
export const TIER_STAFF = "Staff";

// User labels
export const LABEL_YOU = "(you)";
export const LABEL_UNKNOWN = "Unknown";
export const LABEL_NO_INVITER = "—";

// ─────────────────────────────────────────────────────────────────────────────
// Invite dialog
// ─────────────────────────────────────────────────────────────────────────────

export const INVITE_DIALOG_TITLE = "Invite an admin";
export const INVITE_DIALOG_DESCRIPTION =
  "Generate a single-use invite link. Whoever accepts it joins the admin team with the tier you pick, recorded as invited by you.";
export const INVITE_LINK_LABEL = "Invite link";
export const INVITE_EXPIRES_LABEL = "Expires {time} · single use";
export const INVITE_TIER_LABEL = "Tier";
export const INVITE_EMAIL_LABEL = "Email (optional)";
export const INVITE_EMAIL_PLACEHOLDER = "teammate@deenbridge.org";
export const INVITE_BUTTON = "Invite admin";
export const INVITE_GENERATING = "Generating…";
export const INVITE_GENERATE = "Generate invite";
export const INVITE_CLOSE = "Close";

// ─────────────────────────────────────────────────────────────────────────────
// Member actions
// ─────────────────────────────────────────────────────────────────────────────

export const ACTION_DEMOTE_TO_STAFF = "Demote to staff";
export const ACTION_REVOKE_ACCESS = "Revoke access";
export const ACTION_ARIA_LABEL = "Actions for {name}";

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation dialogs
// ─────────────────────────────────────────────────────────────────────────────

export const DEMOTE_DIALOG_TITLE = "Demote admin";
export const DEMOTE_CONFIRMATION = "{name} will lose super-admin permissions and become staff.";
export const DEMOTE_BUTTON = "Demote";

export const REVOKE_DIALOG_TITLE = "Revoke admin access";
export const REVOKE_CONFIRMATION = "{name}'s admin access will be removed entirely.";
export const REVOKE_BUTTON = "Revoke";

// ─────────────────────────────────────────────────────────────────────────────
// Empty states
// ─────────────────────────────────────────────────────────────────────────────

export const EMPTY_STATE_TITLE = "No admins yet";
export const EMPTY_STATE_DESCRIPTION = "Invite your first teammate to start building the admin team.";

export const ERROR_LOAD_TITLE = "Failed to load";
export const ERROR_RETRY_BUTTON = "Try again";
