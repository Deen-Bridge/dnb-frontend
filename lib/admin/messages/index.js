/**
 * @module lib/admin/messages
 * Centralized admin string constants for i18n-readiness (#344)
 * -------------------------------------------------------------------------
 * This module aggregates all admin-facing string constants to prepare for
 * future internationalization (i18n). Currently, all strings are English-only;
 * the goal is to establish consistent patterns that make future translation
 * extraction trivial.
 *
 * Architecture
 * ------------
 * Strings are organized by domain:
 *   - team.js    → Admin team management (invite, demote, revoke)
 *   - audit.js   → Audit logging and action labels
 *   - settings.js → Admin settings and configuration
 *   - common.js  → Shared strings (buttons, status labels, errors)
 *
 * Interpolation Convention
 * ------------------------
 * Dynamic values use placeholder syntax: `{variableName}`
 * Interpolation is handled by the `interpolate()` helper:
 *
 *   import { interpolate, team } from "@/lib/admin/messages";
 *   const msg = interpolate(team.DEMOTE_CONFIRMATION, { name: "Alice" });
 *   // → "Alice will lose super-admin permissions and become staff."
 *
 * For Future Contributors
 * -----------------------
 * 1. Always add new strings to the appropriate domain file
 * 2. Use SCREAMING_SNAKE_CASE for constant names
 * 3. Use sentence case for the actual string values
 * 4. Use `{placeholder}` syntax for dynamic values
 * 5. Keep strings context-free where possible (avoid "Click here")
 * 6. Export from this index file for a single import point
 *
 * @example
 * import { team, common, interpolate } from "@/lib/admin/messages";
 *
 * // Static string
 * <DialogTitle>{team.INVITE_DIALOG_TITLE}</DialogTitle>
 *
 * // Dynamic string
 * <p>{interpolate(team.DEMOTE_CONFIRMATION, { name: user.name })}</p>
 */

// Re-export all domain modules
export * as team from "./team.js";
export * as audit from "./audit.js";
export * as settings from "./settings.js";
export * as common from "./common.js";

/**
 * Interpolate dynamic values into a message template.
 *
 * @param {string} template The message template with {placeholders}
 * @param {Record<string, string|number>} values Key-value pairs to substitute
 * @returns {string} The interpolated message
 *
 * @example
 * interpolate("Hello, {name}!", { name: "World" });
 * // → "Hello, World!"
 *
 * interpolate("{count} items selected", { count: 5 });
 * // → "5 items selected"
 */
export function interpolate(template, values = {}) {
  if (!template || typeof template !== "string") return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Create a message function that pre-binds placeholders.
 * Useful for messages with multiple dynamic values.
 *
 * @param {string} template The message template
 * @returns {(values: Record<string, string|number>) => string} Interpolation function
 *
 * @example
 * const demoteMsg = createMessage(team.DEMOTE_SUCCESS);
 * demoteMsg({ name: "Alice", role: "staff" });
 * // → "Alice has been demoted to staff."
 */
export function createMessage(template) {
  return (values) => interpolate(template, values);
}
