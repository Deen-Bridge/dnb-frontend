"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  // Theme state
  const [theme, setTheme] = useState({
    mode: "light",
    accent: "green",
    fontSize: "medium",
  });

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

  const handleThemeChange = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showMessage("success", "Profile updated successfully!");
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

  const handleThemeSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    showMessage("success", "Theme preferences saved!");
    setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Settings className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className={cn("text-4xl font-bold text-accent")}>Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account preferences and privacy
              </p>
            </div>
          </div>
          {message.text && (
            <Alert
              className={cn(
                "mb-4",
                message.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={cn(
                  message.type === "success" ? "text-green-800" : "text-red-800"
                )}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6 bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
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
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Theme
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Danger
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={profile.avatar || user?.avatar} />
                        <AvatarFallback className="text-2xl bg-accent text-white">
                          {profile.name?.charAt(0) ||
                            user?.name?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile.name || user?.name}
                      </h3>
                      <p className="text-muted-foreground">
                        @{profile.username || user?.username}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {user?.role || "Member"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profile.username}
                        onChange={handleProfileChange}
                        placeholder="Choose a username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={profile.country}
                        onChange={handleProfileChange}
                        placeholder="Your country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
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
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleProfileChange}
                        placeholder="Your gender"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
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
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Account Security
                </CardTitle>
                <CardDescription>
                  Manage your email and password settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccountSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Change Password</h4>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
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
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Update Account
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSave} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={() =>
                          handleNotificationChange("email")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Get instant notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={() => handleNotificationChange("push")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Course Updates
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            New courses and updates
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.courseUpdates}
                        onCheckedChange={() =>
                          handleNotificationChange("courseUpdates")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Message Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            New messages and replies
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.messageNotifications}
                        onCheckedChange={() =>
                          handleNotificationChange("messageNotifications")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Space Reminders
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Upcoming space sessions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.spaceReminders}
                        onCheckedChange={() =>
                          handleNotificationChange("spaceReminders")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">Newsletter</Label>
                          <p className="text-sm text-muted-foreground">
                            Weekly updates and insights
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.newsletter}
                        onCheckedChange={() =>
                          handleNotificationChange("newsletter")
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Preferences
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your information and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePrivacySave} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Profile Visibility
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow others to view your profile
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.profileVisible}
                        onCheckedChange={() =>
                          handlePrivacyChange("profileVisible")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">Online Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Show when you're online
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.showOnline}
                        onCheckedChange={() =>
                          handlePrivacyChange("showOnline")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Allow Messages
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Let others send you messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.allowMessages}
                        onCheckedChange={() =>
                          handlePrivacyChange("allowMessages")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">Show Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Display email on profile
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.showEmail}
                        onCheckedChange={() => handlePrivacyChange("showEmail")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">Show Age</Label>
                          <p className="text-sm text-muted-foreground">
                            Display age on profile
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.showAge}
                        onCheckedChange={() => handlePrivacyChange("showAge")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Palette className="h-5 w-5" />
                        <div>
                          <Label className="font-semibold">
                            Show Interests
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Display interests on profile
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={privacy.showInterests}
                        onCheckedChange={() =>
                          handlePrivacyChange("showInterests")
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Privacy Settings
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" /> Theme & Appearance
                </CardTitle>
                <CardDescription>
                  Customize your interface appearance and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleThemeSave} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme Mode</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["light", "dark", "auto"].map((mode) => (
                          <Button
                            key={mode}
                            type="button"
                            variant={
                              theme.mode === mode ? "default" : "outline"
                            }
                            className="capitalize"
                            onClick={() => handleThemeChange("mode", mode)}
                          >
                            {mode}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {["green", "blue", "purple", "orange", "red"].map(
                          (color) => (
                            <Button
                              key={color}
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-12 w-12 rounded-full p-0",
                                theme.accent === color &&
                                  "ring-2 ring-accent ring-offset-2"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => handleThemeChange("accent", color)}
                            >
                              {theme.accent === color && (
                                <CheckCircle className="h-5 w-5 text-white mx-auto" />
                              )}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["small", "medium", "large"].map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant={
                              theme.fontSize === size ? "default" : "outline"
                            }
                            className="capitalize"
                            onClick={() => handleThemeChange("fontSize", size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Theme
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-red-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
