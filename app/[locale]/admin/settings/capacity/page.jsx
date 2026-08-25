"use client";

import { useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import {
  validateCapacitySettings,
  hasValidationErrors,
  formatLeadTime,
  PLATFORM_LIMITS,
} from "@/lib/validation/space-capacity";

const DEFAULT_SETTINGS = {
  maxConcurrentSpaces: 50,
  defaultMaxParticipants: 25,
  minLeadTimeMinutes: 60,
  enforceLimits: true,
};

export default function CapacitySettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = useCallback((field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const handleSave = useCallback(async () => {
    const validationErrors = validateCapacitySettings(settings);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [settings]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setErrors({});
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={Users}
        title="Space Capacity & Scheduling"
        subtitle="Configure platform-wide limits for live spaces and scheduling guardrails"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
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
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        }
      />

      {/* Scope Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className={cn(poppins_500.className, "text-sm text-blue-800")}>
              Platform-Wide Guardrails
            </p>
            <p className={cn(poppins_400.className, "text-xs text-blue-700")}>
              These settings enforce limits across all spaces. Individual
              educators can set lower values, but never exceed these ceilings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Concurrent Live Spaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-5 w-5" />
              Concurrent Live Spaces
            </CardTitle>
            <CardDescription>
              Maximum number of spaces that can be live at the same time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentSpaces">Max concurrent spaces</Label>
              <Input
                id="maxConcurrentSpaces"
                type="number"
                min={PLATFORM_LIMITS.maxConcurrentSpaces.min}
                max={PLATFORM_LIMITS.maxConcurrentSpaces.max}
                value={settings.maxConcurrentSpaces}
                onChange={(e) =>
                  updateField("maxConcurrentSpaces", parseInt(e.target.value, 10) || "")
                }
                className={errors.maxConcurrentSpaces ? "border-red-500" : ""}
              />
              {errors.maxConcurrentSpaces && (
                <p className="text-xs text-red-500">{errors.maxConcurrentSpaces}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Allowed range: {PLATFORM_LIMITS.maxConcurrentSpaces.min} – {PLATFORM_LIMITS.maxConcurrentSpaces.max}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Max Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Default Max Participants
            </CardTitle>
            <CardDescription>
              Default participant cap applied to newly created rooms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultMaxParticipants">Default participant limit</Label>
              <Input
                id="defaultMaxParticipants"
                type="number"
                min={PLATFORM_LIMITS.defaultMaxParticipants.min}
                max={PLATFORM_LIMITS.defaultMaxParticipants.max}
                value={settings.defaultMaxParticipants}
                onChange={(e) =>
                  updateField("defaultMaxParticipants", parseInt(e.target.value, 10) || "")
                }
                className={errors.defaultMaxParticipants ? "border-red-500" : ""}
              />
              {errors.defaultMaxParticipants && (
                <p className="text-xs text-red-500">{errors.defaultMaxParticipants}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Allowed range: {PLATFORM_LIMITS.defaultMaxParticipants.min} – {PLATFORM_LIMITS.defaultMaxParticipants.max}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduling Lead Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Scheduling Lead Time
          </CardTitle>
          <CardDescription>
            Minimum time required between scheduling a session and it going live
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minLeadTimeMinutes">Minimum lead time (minutes)</Label>
              <Input
                id="minLeadTimeMinutes"
                type="number"
                min={PLATFORM_LIMITS.minLeadTimeMinutes.min}
                max={PLATFORM_LIMITS.minLeadTimeMinutes.max}
                value={settings.minLeadTimeMinutes}
                onChange={(e) =>
                  updateField("minLeadTimeMinutes", parseInt(e.target.value, 10) || "")
                }
                className={errors.minLeadTimeMinutes ? "border-red-500" : ""}
              />
              {errors.minLeadTimeMinutes && (
                <p className="text-xs text-red-500">{errors.minLeadTimeMinutes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Allowed range: {PLATFORM_LIMITS.minLeadTimeMinutes.min} – {PLATFORM_LIMITS.minLeadTimeMinutes.max} minutes
              </p>
            </div>
            <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-6">
              <div className="text-center">
                <p className={cn(poppins_500.className, "text-2xl")}>
                  {formatLeadTime(settings.minLeadTimeMinutes)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">human-readable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enforcement Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enforcement</CardTitle>
          <CardDescription>
            Control whether these limits are enforced or just advisory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className={cn(poppins_500.className, "text-sm")}>
                Enforce limits strictly
              </p>
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                When enabled, requests that exceed these limits will be rejected.
                When disabled, limits are shown as warnings only.
              </p>
            </div>
            <Switch
              checked={settings.enforceLimits}
              onCheckedChange={(checked) => updateField("enforceLimits", checked)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={settings.enforceLimits ? "default" : "secondary"}>
              {settings.enforceLimits ? "Strict enforcement" : "Advisory mode"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
