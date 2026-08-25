"use client";
/**
 * ShortcutCheatsheet — the discoverable `?` overlay for the admin keyboard
 * layer (#336).
 * ---------------------------------------------------------------------------
 * Renders every binding from the shared {@link SHORTCUTS} registry (the same
 * source of truth the hook uses), grouped, with proper `<kbd>` styling. Built
 * on the ui-kit `Dialog` so it inherits focus trapping, an accessible
 * title/description, Escape-to-close and overlay dismissal for free.
 *
 * It is a pure presentational component: open state is owned by
 * `useAdminShortcuts` and passed down, so the `?` key and the overlay stay in
 * sync.
 */
import { useMemo } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHORTCUTS, SEQUENCE_PREFIX } from "@/hooks/useAdminShortcuts";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

/** Best-effort platform detection so we show ⌘ on macOS and Ctrl elsewhere. */
function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  const uaPlatform = navigator.userAgentData?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod/i.test(uaPlatform);
}

/** A single styled key cap. */
function Kbd({ children }) {
  return (
    <kbd
      className={cn(
        poppins_500.className,
        "inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-border bg-surface-raised px-2 py-0.5 text-xs text-ink shadow-sm"
      )}
    >
      {children}
    </kbd>
  );
}

/** Render the key(s) for a shortcut as one or more <kbd> caps. */
function ShortcutKeys({ shortcut }) {
  if (shortcut.type === "sequence") {
    return (
      <span className="flex items-center gap-1" aria-hidden="true">
        <Kbd>{shortcut.keys[0]}</Kbd>
        <span className="text-xs text-ink-muted">then</span>
        <Kbd>{shortcut.keys[1]}</Kbd>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <Kbd>{shortcut.key}</Kbd>
    </span>
  );
}

/** Screen-reader text describing how to trigger a shortcut. */
function keysLabel(shortcut) {
  if (shortcut.type === "sequence") {
    return `Press ${shortcut.keys[0]} then ${shortcut.keys[1]}`;
  }
  return `Press ${shortcut.key}`;
}

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 */
export default function ShortcutCheatsheet({ open, onOpenChange }) {
  const isMac = useMemo(() => isMacPlatform(), []);

  // Group shortcuts in registry order, preserving first-seen group order.
  const groups = useMemo(() => {
    const order = [];
    const byGroup = new Map();
    for (const s of SHORTCUTS) {
      if (!byGroup.has(s.group)) {
        byGroup.set(s.group, []);
        order.push(s.group);
      }
      byGroup.get(s.group).push(s);
    }
    return order.map((name) => ({ name, items: byGroup.get(name) }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-surface-raised">
        <DialogHeader>
          <DialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Keyboard className="h-5 w-5 text-accent" aria-hidden="true" />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Chord shortcuts for admin surfaces. Press{" "}
            <kbd className="rounded border border-border px-1 text-[0.7rem]">
              {SEQUENCE_PREFIX}
            </kbd>{" "}
            then a key to jump to a page. These are plain-key chords (no{" "}
            {isMac ? "⌘" : "Ctrl"}), so they never clash with browser or OS
            shortcuts. The command palette also opens with{" "}
            <kbd className="rounded border border-border px-1 text-[0.7rem]">
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="rounded border border-border px-1 text-[0.7rem]">K</kbd>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-5">
          {groups.map((group) => (
            <section key={group.name} aria-label={group.name}>
              <h3
                className={cn(
                  poppins_600.className,
                  "mb-2 text-xs uppercase tracking-wide text-ink-muted"
                )}
              >
                {group.name}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((shortcut) => (
                  <li
                    key={shortcut.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className={cn(poppins_400.className, "text-sm text-ink")}>
                      {shortcut.label}
                      {shortcut.description ? (
                        <span className="ml-2 text-xs text-ink-muted">
                          {shortcut.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="sr-only">{keysLabel(shortcut)}</span>
                    <ShortcutKeys shortcut={shortcut} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
