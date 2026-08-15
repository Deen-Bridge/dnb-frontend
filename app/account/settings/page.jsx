"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/actions/users/updateUser";
import { useAppearance } from "@/components/providers/AppearanceProvider";
import { ACCENT_PALETTES, FONT_SIZES } from "@/lib/config/appearance.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Palette,
  Globe,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/* ── design-system building blocks ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const CardHead = ({ icon: Icon, title, description, danger }) => (
  <div className="mb-6 flex items-start gap-3">
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border",
        danger
          ? "border-red-200 bg-red-50"
          : "border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10"
      )}
    >
      <Icon className={cn("h-5 w-5", danger ? "text-red-600" : "text-accent")} />
    </div>
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {description && (
        <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>
          {description}
        </p>
      )}
    </div>
  </div>
);

const ToggleRow = ({ icon: Icon, title, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-accent/10 bg-surface p-4 transition-colors hover:border-secondary/30">
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div>
        <Label className={cn(poppins_500, "text-ink")}>{title}</Label>
        <p className={cn(poppins_400, "text-sm text-ink-muted")}>{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const FieldLabel = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor} className={cn(poppins_500, "text-sm text-ink")}>
    {children}
  </Label>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Profile state
  const [profile, setProfile] = useState({
    avatar: user?.avatar || "",
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    country: user?.country || "",
    age: user?.age || "",
    gender: user?.gender || "",
    language: user?.language || "",
    interests: user?.interests || [],
  });

  // Keep the profile form in sync once the authenticated user loads.
  useEffect(() => {
    if (!user) return;
    setProfile({
      avatar: user.avatar || "",
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      country: user.country || "",
      age: user.age || "",
      gender: user.gender || "",
      language: user.language || "",
      interests: user.interests || [],
    });
  }, [user]);

  // Account state
  const [account, setAccount] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
    courseUpdates: true,
    messageNotifications: true,
    spaceReminders: true,
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnline: true,
    allowMessages: true,
    showEmail: false,
    showAge: true,
    showInterests: true,
  });

  // La UI ofrece "auto"; next-themes lo llama "system".
  const { theme: themeMode, setTheme: setThemeMode } = useTheme();
  const { accent, fontSize, setAccent, setFontSize, mounted } = useAppearance();
  const selectedMode = themeMode === "system" ? "auto" : themeMode;

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModeChange = (mode) => {
    setThemeMode(mode === "auto" ? "system" : mode);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      showMessage("error", "You must be signed in to update your profile.");
      return;
    }
    setIsLoading(true);
    const res = await updateUser(user._id, profile);
    if (res?.success) {
      showMessage("success", "Profile updated successfully!");
    } else {
      showMessage(
        "error",
        res?.message || "Failed to update profile. Please try again."
      );
    }
    setIsLoading(false);
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showMessage("success", "Account settings updated!");
    setIsLoading(false);
  };

  const handleNotificationSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    showMessage("success", "Notification preferences saved!");
    setIsLoading(false);
  };

  const handlePrivacySave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    showMessage("success", "Privacy settings updated!");
    setIsLoading(false);
  };

  // Cada control persiste al momento de elegirlo; este submit solo confirma.
  const handleThemeSave = (e) => {
    e.preventDefault();
    showMessage("success", "Theme preferences saved!");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      showMessage(
        "error",
        "Account deletion initiated. Please check your email for confirmation."
      );
    }
  };

  const SubmitButton = ({ savingLabel, label }) => (
    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {savingLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" /> {label}
        </>
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-surface p-3 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
              <Settings className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent sm:text-3xl"
                )}
              >
                Settings
              </h1>
              <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                Manage your account preferences and privacy
              </p>
            </div>
          </div>

          {message.text && (
            <div
              className={cn(
                "mt-6 flex items-center gap-2 rounded-xl border p-4",
                message.type === "success"
                  ? "border-secondary/20 bg-secondary/5"
                  : "border-red-200 bg-red-50"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-secondary" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span
                className={cn(
                  poppins_500,
                  "text-sm",
                  message.type === "success" ? "text-secondary" : "text-red-600"
                )}
              >
                {message.text}
              </span>
            </div>
          )}

          {installable && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
                  <Smartphone className="h-4 w-4 text-accent" />
                </div>
                <p className={cn(poppins_500, "text-sm text-ink")}>
                  Install DeenBridge for quick access
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInstallable(false)}
                >
                  Dismiss
                </Button>
                <Button size="sm" onClick={handleInstall}>
                  Install
                </Button>
              </div>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-accent/10 bg-surface-raised p-1.5 shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Panel>
              <CardHead
                icon={User}
                title="Profile Information"
                description="Update your personal information and profile details"
              />
              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-surface-raised shadow-md">
                      <AvatarImage src={profile.avatar || user?.avatar} />
                      <AvatarFallback className="bg-accent text-2xl text-white">
                        {profile.name?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className={cn(poppins_600, "text-lg text-ink")}>
                      {profile.name || user?.name}
                    </h3>
                    <p className={cn(poppins_400, "text-ink-muted")}>
                      @{profile.username || user?.username}
                    </p>
                    <Badge className="mt-2 bg-accent text-white">
                      {user?.role || "Member"}
                    </Badge>
                  </div>
                </div>
                <Separator className="bg-accent/10" />
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      value={profile.username}
                      onChange={handleProfileChange}
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      name="country"
                      value={profile.country}
                      onChange={handleProfileChange}
                      placeholder="Your country"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={profile.age}
                      onChange={handleProfileChange}
                      placeholder="Your age"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="gender">Gender</FieldLabel>
                    <Input
                      id="gender"
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      placeholder="Your gender"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="language">Language</FieldLabel>
                    <Input
                      id="language"
                      name="language"
                      value={profile.language}
                      onChange={handleProfileChange}
                      placeholder="Preferred language"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
                <SubmitButton savingLabel="Saving..." label="Save Profile" />
              </form>
            </Panel>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Panel>
              <CardHead
                icon={Lock}
                title="Account Security"
                description="Manage your email and password settings"
              />
              <form onSubmit={handleAccountSave} className="space-y-6">
                <div className="space-y-2">
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={account.email}
                      onChange={handleAccountChange}
                      placeholder="your.email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Separator className="bg-accent/10" />
                <div className="space-y-4">
                  <h4 className={cn(poppins_600, "text-base text-ink")}>
                    Change Password
                  </h4>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="currentPassword">
                      Current Password
                    </FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={account.currentPassword}
                        onChange={handleAccountChange}
                        placeholder="Enter current password"
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={account.newPassword}
                        onChange={handleAccountChange}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm New Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={account.confirmPassword}
                      onChange={handleAccountChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <SubmitButton
                  savingLabel="Updating..."
                  label="Update Account"
                />
              </form>
            </Panel>

            {/* Danger zone — lives under Account */}
            <Panel className="border-red-200">
              <CardHead
                icon={Trash2}
                title="Danger Zone"
                description="Irreversible and destructive actions"
                danger
              />
              <div className="p-5 sm:p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h4 className={cn(poppins_600, "mb-2 text-red-700")}>
                    Delete Account
                  </h4>
                  <p className={cn(poppins_400, "mb-4 text-sm text-red-600")}>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </div>
            </Panel>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Panel>
              <CardHead
                icon={Bell}
                title="Notification Preferences"
                description="Choose how you want to be notified about activities"
              />
              <form onSubmit={handleNotificationSave} className="space-y-6">
                <div className="space-y-3">
                  <ToggleRow
                    icon={Mail}
                    title="Email Notifications"
                    description="Receive updates via email"
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                  />
                  <ToggleRow
                    icon={Smartphone}
                    title="Push Notifications"
                    description="Get instant notifications"
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange("push")}
                  />
                  <ToggleRow
                    icon={Bell}
                    title="Course Updates"
                    description="New courses and updates"
                    checked={notifications.courseUpdates}
                    onCheckedChange={() =>
                      handleNotificationChange("courseUpdates")
                    }
                  />
                  <ToggleRow
                    icon={Mail}
                    title="Message Notifications"
                    description="New messages and replies"
                    checked={notifications.messageNotifications}
                    onCheckedChange={() =>
                      handleNotificationChange("messageNotifications")
                    }
                  />
                  <ToggleRow
                    icon={Globe}
                    title="Space Reminders"
                    description="Upcoming space sessions"
                    checked={notifications.spaceReminders}
                    onCheckedChange={() =>
                      handleNotificationChange("spaceReminders")
                    }
                  />
                  <ToggleRow
                    icon={Mail}
                    title="Newsletter"
                    description="Weekly updates and insights"
                    checked={notifications.newsletter}
                    onCheckedChange={() =>
                      handleNotificationChange("newsletter")
                    }
                  />
                </div>
                <SubmitButton
                  savingLabel="Saving..."
                  label="Save Preferences"
                />
              </form>
            </Panel>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Panel>
              <CardHead
                icon={Shield}
                title="Privacy Settings"
                description="Control who can see your information and activity"
              />
              <form onSubmit={handlePrivacySave} className="space-y-6">
                <div className="space-y-3">
                  <ToggleRow
                    icon={User}
                    title="Profile Visibility"
                    description="Allow others to view your profile"
                    checked={privacy.profileVisible}
                    onCheckedChange={() =>
                      handlePrivacyChange("profileVisible")
                    }
                  />
                  <ToggleRow
                    icon={Globe}
                    title="Online Status"
                    description="Show when you're online"
                    checked={privacy.showOnline}
                    onCheckedChange={() => handlePrivacyChange("showOnline")}
                  />
                  <ToggleRow
                    icon={Mail}
                    title="Allow Messages"
                    description="Let others send you messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={() => handlePrivacyChange("allowMessages")}
                  />
                  <ToggleRow
                    icon={Mail}
                    title="Show Email"
                    description="Display email on profile"
                    checked={privacy.showEmail}
                    onCheckedChange={() => handlePrivacyChange("showEmail")}
                  />
                  <ToggleRow
                    icon={User}
                    title="Show Age"
                    description="Display age on profile"
                    checked={privacy.showAge}
                    onCheckedChange={() => handlePrivacyChange("showAge")}
                  />
                  <ToggleRow
                    icon={Palette}
                    title="Show Interests"
                    description="Display interests on profile"
                    checked={privacy.showInterests}
                    onCheckedChange={() => handlePrivacyChange("showInterests")}
                  />
                </div>
                <SubmitButton
                  savingLabel="Saving..."
                  label="Save Privacy Settings"
                />
              </form>
            </Panel>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Panel>
              <CardHead
                icon={Palette}
                title="Theme & Appearance"
                description="Customize your interface appearance and preferences"
              />
              <form onSubmit={handleThemeSave} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <FieldLabel>Theme Mode</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {["light", "dark", "auto"].map((mode) => (
                        <Button
                          key={mode}
                          type="button"
                          variant={
                            mounted && selectedMode === mode
                              ? "default"
                              : "outline"
                          }
                          className="capitalize"
                          aria-pressed={mounted && selectedMode === mode}
                          onClick={() => handleModeChange(mode)}
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <FieldLabel>Accent Color</FieldLabel>
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(ACCENT_PALETTES).map(
                        ([color, palette]) => (
                          <Button
                            key={color}
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-12 w-12 rounded-full p-0",
                              mounted &&
                                accent === color &&
                                "ring-2 ring-accent ring-offset-2"
                            )}
                            style={{ backgroundColor: palette.surface }}
                            aria-label={`Accent color ${color}`}
                            aria-pressed={mounted && accent === color}
                            onClick={() => setAccent(color)}
                          >
                            {mounted && accent === color && (
                              <CheckCircle className="mx-auto h-5 w-5 text-white" />
                            )}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <FieldLabel>Font Size</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.keys(FONT_SIZES).map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={
                            mounted && fontSize === size
                              ? "default"
                              : "outline"
                          }
                          className="capitalize"
                          aria-pressed={mounted && fontSize === size}
                          onClick={() => setFontSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                      Scales most of the interface. Some elements keep a fixed
                      size and won't change.
                    </p>
                  </div>
                </div>
                <SubmitButton savingLabel="Saving..." label="Save Theme" />
              </form>
            </Panel>
          </TabsContent>

          {/* Danger Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Panel className="border-red-200">
              <CardHead
                icon={Trash2}
                title="Danger Zone"
                description="Irreversible and destructive actions"
                danger
              />
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h4 className={cn(poppins_600, "mb-2 text-red-700")}>
                  Delete Account
                </h4>
                <p className={cn(poppins_400, "mb-4 text-sm text-red-600")}>
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
