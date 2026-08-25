"use client";

import React from "react";
import { toast } from "sonner";
import { BellRing, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Settings panel that lets a user enable PWA push notifications and choose
 * which categories they receive (issue #197). Self-contained so it can be
 * dropped into the account settings "Notifications" tab.
 */
export default function PushNotificationCard({ className }) {
  const {
    supported,
    permission,
    subscribed,
    loading,
    preferences,
    types,
    subscribe,
    unsubscribe,
    setPreference,
  } = usePushNotifications();

  const handleEnable = async () => {
    const result = await subscribe();
    if (result.success) {
      toast.success("Push notifications enabled");
    } else if (permission === "denied") {
      toast.error(
        "Notifications are blocked. Enable them in your browser settings to continue."
      );
    } else {
      toast.error(result.error || "Could not enable push notifications");
    }
  };

  const handleDisable = async () => {
    const result = await unsubscribe();
    if (result.success) {
      toast.success("Push notifications disabled");
    } else {
      toast.error(result.error || "Could not disable push notifications");
    }
  };

  if (!supported) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <BellOff className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Push notifications
            </h3>
            <p className="mt-0.5 text-sm text-ink-muted">
              Your browser does not support push notifications. Try installing
              the app or using a supported browser such as Chrome or Firefox.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <BellRing className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Push notifications
            </h3>
            <p className="mt-0.5 text-sm text-ink-muted">
              Get notified about new messages and updates even when the app is
              closed.
            </p>
          </div>
        </div>
        <Badge variant={subscribed ? "default" : "secondary"}>
          {subscribed ? "On" : "Off"}
        </Badge>
      </div>

      {permission === "denied" && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
          Notifications are blocked for this site. Update your browser
          permissions to turn them on.
        </p>
      )}

      <div className="mb-6">
        {subscribed ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDisable}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BellOff className="mr-2 h-4 w-4" />
            )}
            Turn off notifications
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleEnable}
            disabled={loading || permission === "denied"}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="mr-2 h-4 w-4" />
            )}
            Enable notifications
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <fieldset disabled={!subscribed} className="space-y-3">
        <legend className="mb-2 text-sm font-medium text-ink">
          Notify me about
        </legend>
        {types.map((type) => (
          <div
            key={type.key}
            className={cn(
              "flex items-center justify-between gap-4 rounded-xl border border-accent/10 bg-surface p-4",
              !subscribed && "opacity-60"
            )}
          >
            <div>
              <Label
                htmlFor={`push-${type.key}`}
                className="font-medium text-ink"
              >
                {type.label}
              </Label>
              <p className="mt-0.5 text-sm text-ink-muted">
                {type.description}
              </p>
            </div>
            <Switch
              id={`push-${type.key}`}
              checked={Boolean(preferences[type.key])}
              onCheckedChange={(value) => setPreference(type.key, value)}
              disabled={!subscribed}
            />
          </div>
        ))}
      </fieldset>
    </div>
  );
}
