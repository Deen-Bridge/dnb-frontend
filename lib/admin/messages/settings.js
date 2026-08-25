/**
 * @module lib/admin/messages/settings
 * Admin settings strings (#344)
 * -------------------------------------------------------------------------
 * Strings for admin settings pages: feature flags, session security,
 * integrations, and policies.
 *
 * Placeholder conventions:
 *   {name}    → Setting or flag name
 *   {value}   → Current value
 *   {minutes} → Duration in minutes
 */

// ─────────────────────────────────────────────────────────────────────────────
// Settings navigation
// ─────────────────────────────────────────────────────────────────────────────

export const NAV_GENERAL = "General";
export const NAV_FEATURE_FLAGS = "Feature flags";
export const NAV_SESSION_SECURITY = "Session security";
export const NAV_INTEGRATIONS = "Integrations";
export const NAV_POLICIES = "Policies";
export const NAV_BRANDING = "Branding";

// ─────────────────────────────────────────────────────────────────────────────
// Feature flags page
// ─────────────────────────────────────────────────────────────────────────────

export const FLAGS_PAGE_TITLE = "Feature flags";
export const FLAGS_PAGE_SUBTITLE = "Toggle experimental features and rollout controls";

export const FLAG_ENABLED = "Enabled";
export const FLAG_DISABLED = "Disabled";
export const FLAG_TOGGLE_LABEL = "Toggle {name}";
export const FLAG_CONFIRM_ENABLE = "Enable {name}?";
export const FLAG_CONFIRM_DISABLE = "Disable {name}?";
export const FLAG_CONFIRM_DESCRIPTION = "This change will take effect immediately for all users.";

// ─────────────────────────────────────────────────────────────────────────────
// Session security page
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_PAGE_TITLE = "Session security";
export const SESSION_PAGE_SUBTITLE = "Configure admin session timeouts and re-authentication";

export const SESSION_IDLE_TIMEOUT = "Idle timeout";
export const SESSION_IDLE_TIMEOUT_DESC = "Log out admin users after this period of inactivity";
export const SESSION_IDLE_MINUTES = "{minutes} minutes";

export const SESSION_REAUTH_TIMEOUT = "Re-authentication timeout";
export const SESSION_REAUTH_TIMEOUT_DESC = "Require password confirmation for sensitive actions after this period";

export const SESSION_WARNING_BEFORE = "Warning before logout";
export const SESSION_WARNING_BEFORE_DESC = "Show idle warning this many seconds before automatic logout";
export const SESSION_WARNING_SECONDS = "{seconds} seconds";

export const SESSION_SAVE_BUTTON = "Save settings";
export const SESSION_SAVE_SUCCESS = "Session security settings updated";
export const SESSION_SAVE_ERROR = "Failed to save session settings";

// ─────────────────────────────────────────────────────────────────────────────
// Integrations page
// ─────────────────────────────────────────────────────────────────────────────

export const INTEGRATIONS_PAGE_TITLE = "Integrations";
export const INTEGRATIONS_PAGE_SUBTITLE = "Connect external services and APIs";

export const INTEGRATION_CONNECTED = "Connected";
export const INTEGRATION_DISCONNECTED = "Not connected";
export const INTEGRATION_CONNECT = "Connect";
export const INTEGRATION_DISCONNECT = "Disconnect";
export const INTEGRATION_CONFIGURE = "Configure";

export const INTEGRATION_CONFIRM_DISCONNECT = "Disconnect {name}?";
export const INTEGRATION_DISCONNECT_WARNING =
  "This will remove the integration. You'll need to reconnect to restore functionality.";

// ─────────────────────────────────────────────────────────────────────────────
// Policies page
// ─────────────────────────────────────────────────────────────────────────────

export const POLICIES_PAGE_TITLE = "Policies";
export const POLICIES_PAGE_SUBTITLE = "Manage content and moderation policies";

export const POLICY_UPDATED = "Policy updated successfully";
export const POLICY_UPDATE_ERROR = "Failed to update policy";

// ─────────────────────────────────────────────────────────────────────────────
// Reconciliation page
// ─────────────────────────────────────────────────────────────────────────────

export const RECONCILIATION_PAGE_TITLE = "Reconciliation";
export const RECONCILIATION_PAGE_SUBTITLE = "Review and resolve unreconciled payments";

export const RECONCILIATION_EMPTY_TITLE = "All clear";
export const RECONCILIATION_EMPTY_DESC = "No unreconciled payments at this time.";
export const RECONCILIATION_RESOLVE = "Mark resolved";
export const RECONCILIATION_RETRY = "Retry matching";
