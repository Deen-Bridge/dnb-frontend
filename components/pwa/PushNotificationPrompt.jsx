"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const DISMISS_STORAGE_KEY = "dnb:push-prompt-dismissed";

/**
 * Non-intrusive banner that invites the user to enable push notifications
 * (issue #197). It only appears when notifications are supported, permission
 * has not yet been decided, and the user has not dismissed it before — so it
 * never nags and never blocks the UI.
 */
export default function PushNotificationPrompt() {
  const { supported, permission, subscribed, loading, subscribe } =
    usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed =
      window.localStorage.getItem(DISMISS_STORAGE_KEY) === "true";
    setVisible(supported && permission === "default" && !subscribed && !dismissed);
  }, [supported, permission, subscribed]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "true");
    } catch {
      /* ignore storage errors */
    }
  };

  const handleEnable = async () => {
    const result = await subscribe();
    if (result.success) {
      toast.success("Push notifications enabled");
      setVisible(false);
    } else {
      toast.error(result.error || "Could not enable push notifications");
      if (permission === "denied") setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-xl border border-accent/10 bg-surface-raised p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
          <BellRing className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Stay in the loop</p>
          <p className="text-sm text-ink-muted">
            Turn on notifications for new messages, course updates and replies.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" size="sm" onClick={handleEnable} disabled={loading}>
          Enable
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={dismiss}
          aria-label="Dismiss notification prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
