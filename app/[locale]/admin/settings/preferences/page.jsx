"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog,
  Globe,
  Clock,
  EyeOff,
  Bell,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
} from "lucide-react";
import useAdminPreferences from "@/hooks/useAdminPreferences";

const LANDING_PAGES = [
  { label: "Dashboard", value: "/admin" },
  { label: "Courses", value: "/admin/courses" },
  { label: "Library", value: "/admin/library" },
  { label: "Users", value: "/admin/users" },
  { label: "Analytics", value: "/admin/analytics" },
  { label: "Settings", value: "/admin/settings" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
];

const EMAIL_NOTIFICATIONS = [
  {
    key: "newUsers",
    label: "New user registrations",
    description: "Notify when a new user signs up",
  },
  {
    key: "newOrders",
    label: "New purchases",
    description: "Notify when a course is purchased",
  },
  {
    key: "reports",
    label: "Content reports",
    description: "Notify when content is reported by users",
  },
  {
    key: "systemAlerts",
    label: "System alerts",
    description: "Notify on critical system events",
  },
];

export default function AdminPreferencesPage() {
  const { prefs, loaded, updatePref, updateEmailNotification, resetDefaults } =
    useAdminPreferences();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  if (!loaded) {
    return (
      <PageShell>
        <PageHeader
          icon={UserCog}
          title="Admin Preferences"
          subtitle="Manage your personal admin settings"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={UserCog}
        title="Admin Preferences"
        subtitle="Manage your personal admin settings"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Default Landing Page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              Default Landing Page
            </CardTitle>
            <CardDescription>
              Choose where to go after logging in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Post-login destination</Label>
              <Select
                value={prefs.defaultLandingPage}
                onValueChange={(v) => updatePref("defaultLandingPage", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_PAGES.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Timezone Override */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Timezone Override
            </CardTitle>
            <CardDescription>
              Affects charts, date displays, and scheduled actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={prefs.timezone}
                onValueChange={(v) => updatePref("timezone", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media Blur Default */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <EyeOff className="h-5 w-5" />
              Media Blur Default
            </CardTitle>
            <CardDescription>
              Blur sensitive media content by default (ties into #268)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable media blur</Label>
                <p className="text-sm text-muted-foreground">
                  Sensitive images will be blurred until clicked
                </p>
              </div>
              <Switch
                checked={prefs.mediaBlurDefault}
                onCheckedChange={(v) => updatePref("mediaBlurDefault", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notification Opt-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose which admin event notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {EMAIL_NOTIFICATIONS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={prefs.emailNotifications[item.key]}
                  onCheckedChange={(v) =>
                    updateEmailNotification(item.key, v)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
