export const PAGE_TITLE = "Audit logs";
export const PAGE_SUBTITLE = "Review admin actions and system changes";

export const TABLE_HEADER_TIMESTAMP = "Timestamp";
export const TABLE_HEADER_ACTOR = "Actor";
export const TABLE_HEADER_ACTION = "Action";
export const TABLE_HEADER_TARGET = "Target";
export const TABLE_HEADER_DETAILS = "Details";

export const ACTION_ROLE_CHANGE = "Role change";
export const ACTION_BAN = "User banned";
export const ACTION_UNBAN = "User unbanned";
export const ACTION_CONTENT_TAKEDOWN = "Content takedown";
export const ACTION_CONTENT_RESTORE = "Content restored";
export const ACTION_REFUND_ISSUED = "Refund issued";
export const ACTION_BROADCAST_SENT = "Broadcast sent";
export const ACTION_FLAG_TOGGLE = "Feature flag toggled";
export const ACTION_SETTINGS_CHANGE = "Settings changed";
export const ACTION_INVITE_CREATED = "Invite created";
export const ACTION_INVITE_ACCEPTED = "Invite accepted";
export const ACTION_LOGIN = "Admin login";
export const ACTION_LOGOUT = "Admin logout";

export const DESC_ROLE_CHANGE = "{actor} changed {target}'s role";
export const DESC_BAN = "{actor} banned {target}";
export const DESC_UNBAN = "{actor} unbanned {target}";
export const DESC_TAKEDOWN = "{actor} removed content from {target}";
export const DESC_RESTORE = "{actor} restored content for {target}";
export const DESC_REFUND = "{actor} issued a refund to {target}";
export const DESC_BROADCAST = "{actor} sent a broadcast to {target}";
export const DESC_FLAG = "{actor} toggled feature flag: {details}";

export const FILTER_ALL_ACTIONS = "All actions";
export const FILTER_ALL_ACTORS = "All admins";
export const FILTER_DATE_RANGE = "Date range";
export const FILTER_LAST_24H = "Last 24 hours";
export const FILTER_LAST_7D = "Last 7 days";
export const FILTER_LAST_30D = "Last 30 days";
export const FILTER_CUSTOM = "Custom range";

export const EMPTY_STATE_TITLE = "No audit logs found";
export const EMPTY_STATE_DESCRIPTION = "No admin actions match your current filters.";
export const EMPTY_STATE_NO_ACTIVITY = "No recent admin activity to display.";

export const ERROR_LOAD_TITLE = "Failed to load audit logs";
export const ERROR_LOAD_DESCRIPTION = "There was a problem fetching the audit history.";
