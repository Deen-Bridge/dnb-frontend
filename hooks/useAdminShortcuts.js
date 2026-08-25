"use client";
/**
 * useAdminShortcuts — a two-key-sequence ("chord") keyboard layer for power
 * admins (#336).
 * ---------------------------------------------------------------------------
 * Power admins asked for Gmail/GitHub-style keyboard navigation: press a
 * prefix key (`g`, for "go to") and then a second key to jump straight to an
 * admin surface, plus a discoverable `?` cheatsheet. This hook implements the
 * state machine; the guard (`AdminShortcutsProvider`) decides *when* it is
 * armed and renders the overlay.
 *
 * Design constraints (why it is built this way):
 *   - **No conflict with the CommandPalette (⌘K / Ctrl+K).** The palette owns
 *     modifier combos. We therefore IGNORE any event where
 *     `metaKey || ctrlKey || altKey` is held, so ⌘K/Ctrl+K/⌥… never reach us
 *     and stay with the OS/browser/palette. Our bindings are plain, unmodified
 *     keys — true "chords", which also means they never collide with macOS or
 *     Windows modifier conventions.
 *   - **Never hijack typing.** If the event originates from a text field
 *     (INPUT/TEXTAREA/SELECT, `contenteditable`, or a `role="textbox"`), we
 *     bail — an admin filling a form can still type `g`, `?`, etc.
 *   - **Discoverable & single-source-of-truth.** Every binding lives in
 *     {@link SHORTCUTS}; the cheatsheet renders from the same list so docs can
 *     never drift from behaviour.
 *   - **Integration, not duplication.** The palette binding dispatches the
 *     existing `open-command-palette` window event rather than re-implementing
 *     search.
 *
 * The hook is a no-op whenever `enabled` is false, so mounting it app-wide is
 * safe: it only listens while an admin is on an `/admin` surface.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** The prefix key that opens the "go to" sequence window. */
export const SEQUENCE_PREFIX = "g";

/** How long (ms) after the prefix we wait for the second key before cancelling. */
export const SEQUENCE_TIMEOUT_MS = 1000;

/**
 * The canonical shortcut registry — the single source of truth shared by the
 * hook (behaviour) and the cheatsheet (documentation).
 *
 * Each entry is one of:
 *   - a "sequence" binding: `{ type, keys: [prefix, second], href|event, ... }`
 *   - a "single" binding:   `{ type, key, event|action, ... }`
 *
 * Hrefs map to admin routes that actually exist in the app router. They are
 * locale-agnostic (next-intl middleware prepends the active locale).
 *
 * @typedef {Object} Shortcut
 * @property {"sequence"|"single"} type
 * @property {string[]} [keys]   two keys for a sequence binding
 * @property {string}   [key]    single key for a single binding
 * @property {string}   [href]   navigation target for "go to" bindings
 * @property {string}   [event]  window CustomEvent to dispatch (integration)
 * @property {string}   label    short human label for the cheatsheet
 * @property {string}   [description] longer description for the cheatsheet
 * @property {string}   group    cheatsheet grouping
 */

/** @type {ReadonlyArray<Shortcut>} */
export const SHORTCUTS = Object.freeze([
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "d"],
    href: "/dashboard/admin",
    label: "Go to Admin dashboard",
    group: "Navigate",
  },
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "t"],
    href: "/dashboard/admin/team",
    label: "Go to Team",
    group: "Navigate",
  },
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "a"],
    href: "/dashboard/admin/audit-logs",
    label: "Go to Audit logs",
    group: "Navigate",
  },
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "r"],
    href: "/dashboard/admin/reconciliation",
    label: "Go to Reconciliation",
    group: "Navigate",
  },
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "s"],
    href: "/dashboard/admin/settings/flags",
    label: "Go to Feature flags",
    group: "Navigate",
  },
  {
    type: "sequence",
    keys: [SEQUENCE_PREFIX, "m"],
    href: "/dashboard/admin/settings/maintenance",
    label: "Go to Maintenance",
    group: "Navigate",
  },
  {
    type: "single",
    key: "/",
    event: "open-command-palette",
    label: "Open command palette",
    description: "Also available with ⌘K / Ctrl+K.",
    group: "Tools",
  },
  {
    type: "single",
    key: "?",
    action: "toggle-cheatsheet",
    label: "Show this cheatsheet",
    group: "Help",
  },
]);

/** Sequence bindings keyed by their second key, for O(1) lookup. */
const SEQUENCE_BY_SECOND_KEY = SHORTCUTS.reduce((acc, s) => {
  if (s.type === "sequence" && s.keys?.[0] === SEQUENCE_PREFIX) {
    acc[s.keys[1]] = s;
  }
  return acc;
}, /** @type {Record<string, Shortcut>} */ ({}));

/**
 * Whether the keydown originated from an editable surface where the user is
 * (or may be) typing — in which case shortcuts must not fire.
 *
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
function isTypingTarget(target) {
  if (!target || typeof target !== "object" || !("tagName" in target)) {
    return false;
  }
  const el = /** @type {HTMLElement} */ (target);
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  // Composite widgets that accept text (e.g. cmdk input, rich editors).
  if (typeof el.closest === "function") {
    if (el.closest('[contenteditable="true"],[contenteditable=""]')) return true;
    if (el.closest('[role="textbox"]')) return true;
  }
  return false;
}

/**
 * The admin keyboard-shortcut state machine.
 *
 * @param {Object} [options]
 * @param {boolean} [options.enabled] arm the listener (admin + on /admin route)
 * @returns {{
 *   isCheatsheetOpen: boolean,
 *   setCheatsheetOpen: (open: boolean) => void,
 *   shortcuts: ReadonlyArray<Shortcut>,
 * }}
 */
export default function useAdminShortcuts({ enabled = false } = {}) {
  const router = useRouter();
  const [isCheatsheetOpen, setCheatsheetOpen] = useState(false);

  // `g` was pressed and we're within the window awaiting a second key.
  const awaitingSecondKeyRef = useRef(false);
  const timerRef = useRef(null);

  const clearSequence = useCallback(() => {
    awaitingSecondKeyRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // When disarmed, forget any half-typed sequence and close the overlay so we
  // never leave stale state behind after leaving an admin route / signing out.
  useEffect(() => {
    if (!enabled) {
      clearSequence();
      setCheatsheetOpen(false);
    }
  }, [enabled, clearSequence]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (e) => {
      // Leave modifier combos (⌘K, Ctrl+K, ⌥…) to the OS / CommandPalette.
      if (e.metaKey || e.ctrlKey || e.altKey) {
        clearSequence();
        return;
      }
      // Never intercept while the user is typing.
      if (isTypingTarget(e.target)) return;

      const key = e.key;

      // Escape always closes the cheatsheet (and cancels any sequence).
      if (key === "Escape") {
        clearSequence();
        setCheatsheetOpen((open) => (open ? false : open));
        return;
      }

      // Second key of a `g <key>` sequence.
      if (awaitingSecondKeyRef.current) {
        clearSequence();
        const match = SEQUENCE_BY_SECOND_KEY[key?.toLowerCase?.()];
        if (match) {
          e.preventDefault();
          if (match.href) router.push(match.href);
          else if (match.event) window.dispatchEvent(new CustomEvent(match.event));
        }
        // A non-matching second key simply cancels — no action.
        return;
      }

      // `?` (Shift+/) toggles the cheatsheet.
      if (key === "?") {
        e.preventDefault();
        setCheatsheetOpen((open) => !open);
        return;
      }

      // `/` opens the command palette (integration with the existing widget).
      if (key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-command-palette"));
        return;
      }

      // Prefix key: start the sequence window.
      if (key?.toLowerCase?.() === SEQUENCE_PREFIX) {
        e.preventDefault();
        awaitingSecondKeyRef.current = true;
        timerRef.current = setTimeout(clearSequence, SEQUENCE_TIMEOUT_MS);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearSequence();
    };
  }, [enabled, router, clearSequence]);

  return { isCheatsheetOpen, setCheatsheetOpen, shortcuts: SHORTCUTS };
}
