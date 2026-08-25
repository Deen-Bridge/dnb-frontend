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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Bell,
  Mail,
  Eye,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminToastSuccess, adminToastError } from "@/lib/utils/admin-toast";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

// Preset accent colors
const ACCENT_COLORS = [
  { name: "Green (Default)", value: "#009900", preview: "bg-[#009900]" },
  { name: "Blue", value: "#2563eb", preview: "bg-blue-600" },
  { name: "Purple", value: "#7c3aed", preview: "bg-purple-600" },
  { name: "Orange", value: "#ea580c", preview: "bg-orange-600" },
  { name: "Teal", value: "#0d9488", preview: "bg-teal-600" },
  { name: "Rose", value: "#e11d48", preview: "bg-rose-600" },
];

// Mock current settings
const initialSettings = {
  bannerTheme: "default", // "default" | "accent"
  toastTheme: "default",
  emailLogo: null,
  accentColor: "#009900",
};

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

  // Handle logo upload via Cloudinary
  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      adminToastError({ title: "Please upload an image file" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      adminToastError({ title: "File size must be less than 2MB" });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewLogo(event.target?.result);
      };
      reader.readAsDataURL(file);

      // In production, upload to Cloudinary
      // const formData = new FormData();
      // formData.append("file", file);
      // formData.append("upload_preset", "your_unsigned_preset");
      // const response = await fetch(
      //   "https://api.cloudinary.com/v1_1/your_cloud/image/upload",
      //   { method: "POST", body: formData }
      // );
      // const data = await response.json();
      // setSettings((prev) => ({ ...prev, emailLogo: data.secure_url }));

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSettings((prev) => ({
        ...prev,
        emailLogo: "https://example.com/uploaded-logo.png",
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      adminToastError({
        title: "Failed to upload logo. Please try again.",
        action: { label: "Retry", onClick: () => handleLogoUpload(e) },
      });
    } finally {
      setUploading(false);
    }
  }, []);

  // Remove logo
  const handleRemoveLogo = useCallback(() => {
    setSettings((prev) => ({ ...prev, emailLogo: null }));
    setPreviewLogo(null);
  }, []);

  // Save settings
  const handleSave = useCallback(async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    setSaved(true);
    adminToastSuccess({ title: "Branding settings saved" });
    setTimeout(() => setSaved(false), 3000);
  }, []);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setSettings(initialSettings);
    setPreviewLogo(null);
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={Palette}
        title="Theme & Branding"
        subtitle="Customize appearance for admin-controlled communications"
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
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div>
            <p className={cn(poppins_500.className, "text-sm text-blue-800")}>
              Admin-Controlled Surfaces Only
            </p>
            <p className={cn(poppins_400.className, "text-xs text-blue-700")}>
              These settings only affect banners, toasts, and announcement emails.
              The global app theme is managed separately.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Banner & Toast Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Banner & Toast Theme
            </CardTitle>
            <CardDescription>
              Choose theme for notification banners and toast messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banner Theme */}
            <div className="space-y-3">
              <Label>Banner Style</Label>
              <Select
                value={settings.bannerTheme}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, bannerTheme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Theme</SelectItem>
                  <SelectItem value="accent">Accent Brand Color</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toast Theme */}
            <div className="space-y-3">
              <Label>Toast Style</Label>
              <Select
                value={settings.toastTheme}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, toastTheme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Theme</SelectItem>
                  <SelectItem value="accent">Accent Brand Color</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accent Color Selection */}
            {(settings.bannerTheme === "accent" || settings.toastTheme === "accent") && (
              <div className="space-y-3">
                <Label>Accent Color</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, accentColor: color.value }))
                      }
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition-all",
                        color.preview,
                        settings.accentColor === color.value
                          ? "border-foreground ring-2 ring-offset-2"
                          : "border-transparent hover:scale-110"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {ACCENT_COLORS.find((c) => c.value === settings.accentColor)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Email Logo
            </CardTitle>
            <CardDescription>
              Logo displayed in announcement and notification emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Logo */}
            <div className="space-y-2">
              <Label>Current Logo</Label>
              <div className="rounded-lg border border-dashed p-4 bg-muted/50">
                {previewLogo || settings.emailLogo ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={previewLogo || settings.emailLogo}
                        alt="Email logo"
                        className="h-12 w-auto object-contain"
                      />
                      <Badge variant="outline">Uploaded</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <p className="text-sm">No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-2">
              <Label>Upload New Logo</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: PNG or SVG, max 2MB, 200x50px minimum
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your branding will appear in communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner Preview */}
          <div className="space-y-2">
            <Label>Banner Preview</Label>
            <div
              className={cn(
                "rounded-lg p-4 text-white",
                settings.bannerTheme === "accent" ? "" : "bg-gradient-to-r from-secondary to-highlight"
              )}
              style={
                settings.bannerTheme === "accent"
                  ? { backgroundColor: settings.accentColor }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className={cn(poppins_500.className)}>
                  New announcement: Platform maintenance scheduled
                </span>
              </div>
            </div>
          </div>

          {/* Toast Preview */}
          <div className="space-y-2">
            <Label>Toast Preview</Label>
            <div className="flex justify-end">
              <div
                className={cn(
                  "rounded-lg px-4 py-3 text-white shadow-lg max-w-sm",
                  settings.toastTheme === "accent" ? "" : "bg-gradient-to-r from-secondary to-highlight"
                )}
                style={
                  settings.toastTheme === "accent"
                    ? { backgroundColor: settings.accentColor }
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Changes saved successfully!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="space-y-2">
            <Label>Email Header Preview</Label>
            <div className="rounded-lg border bg-white p-6">
              <div className="flex items-center justify-center border-b pb-4 mb-4">
                {previewLogo || settings.emailLogo ? (
                  <img
                    src={previewLogo || settings.emailLogo}
                    alt="Email logo"
                    className="h-10 w-auto"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-800">
                    Deen Bridge
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Important Announcement
                </h3>
                <p className="text-sm text-gray-600">
                  This is a preview of how your announcement emails will appear
                  to recipients with your custom branding.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
