"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Search,
  Shield,
  CreditCard,
  Flag,
  Plug,
  ChevronRight,
  Globe,
  Users,
  Bell,
  Lock,
  Palette,
  Database,
  Mail,
  Webhook,
  ToggleLeft,
  DollarSign,
  Percent,
  Clock,
  FileText,
  AlertTriangle,
  Zap,
  UserCog,
  Eye,
} from "lucide-react";

// Settings sections configuration
const settingsSections = [
  {
    id: "general",
    title: "General Platform Settings",
    description: "Core platform configuration and branding",
    icon: Globe,
    href: "/admin/settings/general",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    settings: [
      { label: "Platform Name", description: "Set the display name of the platform" },
      { label: "Default Language", description: "Set the default language for new users" },
      { label: "Timezone Settings", description: "Configure default timezone" },
      { label: "Maintenance Mode", description: "Enable/disable maintenance mode" },
      { label: "User Registration", description: "Allow or restrict new registrations" },
      { label: "Email Verification", description: "Require email verification for new users" },
    ],
  },
  {
    id: "moderation",
    title: "Moderation Defaults",
    description: "Content moderation and review policies",
    icon: Shield,
    href: "/admin/settings/moderation",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    settings: [
      { label: "Auto-moderation", description: "Enable AI-powered content moderation" },
      { label: "Review Queue Threshold", description: "Set confidence threshold for manual review" },
      { label: "Profanity Filter", description: "Configure profanity detection levels" },
      { label: "Spam Detection", description: "Set spam detection sensitivity" },
      { label: "User Report Threshold", description: "Auto-flag content after X reports" },
      { label: "Appeal Process", description: "Configure appeal handling workflow" },
    ],
  },
  {
    id: "payment",
    title: "Payment Policy Numbers",
    description: "Financial settings and transaction policies",
    icon: CreditCard,
    href: "/admin/settings/payment",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    settings: [
      { label: "Platform Fee Percentage", description: "Set platform commission rate" },
      { label: "Minimum Withdrawal", description: "Set minimum withdrawal amount" },
      { label: "Payout Schedule", description: "Configure educator payout frequency" },
      { label: "Refund Window", description: "Set refund eligibility period in days" },
      { label: "Currency Settings", description: "Configure supported currencies" },
      { label: "Tax Settings", description: "Configure tax calculation rules" },
    ],
  },
  {
    id: "features",
    title: "Feature Flags",
    description: "Enable or disable platform features",
    icon: Flag,
    href: "/admin/settings/features",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    badge: "Beta",
    settings: [
      { label: "AI Assistant", description: "Enable AI-powered learning assistant" },
      { label: "Live Sessions", description: "Enable real-time video sessions" },
      { label: "Gamification", description: "Enable badges and achievements" },
      { label: "Social Features", description: "Enable following and social feeds" },
      { label: "Stellar Payments", description: "Enable blockchain payments" },
      { label: "Dark Mode", description: "Allow users to switch to dark theme" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations Status",
    description: "Third-party services and API connections",
    icon: Plug,
    href: "/admin/settings/integrations",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    settings: [
      { label: "Stellar Network", description: "Blockchain payment integration status" },
      { label: "Cloudinary", description: "Media storage service connection" },
      { label: "Email Provider", description: "Transactional email service status" },
      { label: "Analytics", description: "Analytics platform integration" },
      { label: "Webhooks", description: "Outbound webhook configurations" },
      { label: "OAuth Providers", description: "Social login integrations" },
    ],
  },
  {
    id: "preferences",
    title: "Admin Preferences",
    description: "Your personal admin settings and defaults",
    icon: UserCog,
    href: "/admin/settings/preferences",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    settings: [
      { label: "Default Landing Page", description: "Choose where to go after login" },
      { label: "Timezone Override", description: "Set your preferred timezone" },
      { label: "Media Blur Default", description: "Blur sensitive content by default" },
      { label: "Email Notifications", description: "Manage admin notification opt-ins" },
    ],
  },
];

// Flatten all settings for search
const allSettings = settingsSections.flatMap((section) =>
  section.settings.map((setting) => ({
    ...setting,
    sectionId: section.id,
    sectionTitle: section.title,
    sectionHref: section.href,
  }))
);

// Icon mapping for setting types
const getSettingIcon = (label) => {
  const iconMap = {
    "Platform Name": Globe,
    "Default Language": Globe,
    "Timezone Settings": Clock,
    "Maintenance Mode": AlertTriangle,
    "User Registration": Users,
    "Email Verification": Mail,
    "Auto-moderation": Shield,
    "Review Queue Threshold": FileText,
    "Profanity Filter": AlertTriangle,
    "Spam Detection": AlertTriangle,
    "User Report Threshold": Flag,
    "Appeal Process": FileText,
    "Platform Fee Percentage": Percent,
    "Minimum Withdrawal": DollarSign,
    "Payout Schedule": Clock,
    "Refund Window": Clock,
    "Currency Settings": DollarSign,
    "Tax Settings": Percent,
    "AI Assistant": Zap,
    "Live Sessions": Users,
    "Gamification": Flag,
    "Social Features": Users,
    "Stellar Payments": CreditCard,
    "Dark Mode": Palette,
    "Stellar Network": Plug,
    "Cloudinary": Database,
    "Email Provider": Mail,
    "Analytics": FileText,
    "Webhooks": Webhook,
    "OAuth Providers": Lock,
    "Default Landing Page": Globe,
    "Timezone Override": Clock,
    "Media Blur Default": Eye,
    "Email Notifications": Bell,
  };
  return iconMap[label] || Settings;
};

export default function AdminSettingsHub() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter settings based on search
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSettings.filter(
      (setting) =>
        setting.label.toLowerCase().includes(query) ||
        setting.description.toLowerCase().includes(query) ||
        setting.sectionTitle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <PageShell>
      <PageHeader
        icon={Settings}
        title="Settings"
        subtitle="Configure platform settings, policies, and integrations"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Search Results ({filteredSettings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSettings.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No settings found matching "{searchQuery}"
              </p>
            ) : (
              <div className="space-y-2">
                {filteredSettings.map((setting, idx) => {
                  const SettingIcon = getSettingIcon(setting.label);
                  return (
                    <Link
                      key={idx}
                      href={setting.sectionHref}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-accent/10">
                        <SettingIcon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{setting.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {setting.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {setting.sectionTitle}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Sections Grid */}
      {!showSearchResults && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Link key={section.id} href={section.href}>
                <Card className="h-full hover:border-accent/50 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${section.bgColor}`}>
                        <SectionIcon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      {section.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="flex items-center gap-2 mt-4">
                      {section.title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.settings.slice(0, 3).map((setting, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                          {setting.label}
                        </div>
                      ))}
                      {section.settings.length > 3 && (
                        <p className="text-xs text-muted-foreground pl-3.5">
                          +{section.settings.length - 3} more settings
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {!showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Overview</CardTitle>
            <CardDescription>
              Current configuration status across all settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ToggleLeft className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Active Features</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Plug className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-muted-foreground">Connected Integrations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Shield className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Moderation Rules</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5%</p>
                  <p className="text-xs text-muted-foreground">Platform Fee</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
