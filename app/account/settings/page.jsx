"use client"
import React, { useState } from "react";

const SettingsPage = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [profile, setProfile] = useState({
    avatar: "",
    name: "",
    username: "",
    bio: "",
  });
  const [account, setAccount] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newsletter: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnline: true,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationsChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacy((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-highlight mb-8">Settings</h1>
      <div className="flex gap-4 mb-8 border-b border-muted-foreground/20">
        {[
          { key: "profile", label: "Profile" },
          { key: "account", label: "Account" },
          { key: "notifications", label: "Notifications" },
          { key: "privacy", label: "Privacy" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`py-2 px-4 font-semibold border-b-2 transition ${selectedTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-accent"
              }`}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/70 rounded-xl shadow p-6">
        {selectedTab === "profile" && (
          <form className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <div>
              <label className="block font-semibold mb-1">Avatar</label>
              <input
                type="file"
                accept="image/*"
                className="block"
                name="avatar"
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    avatar: e.target.files[0],
                  }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-6 py-2 rounded font-semibold"
            >
              Save Profile
            </button>
          </form>
        )}

        {selectedTab === "account" && (
          <form className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleAccountChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={account.currentPassword}
                onChange={handleAccountChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Current password"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={account.newPassword}
                onChange={handleAccountChange}
                className="w-full border rounded px-3 py-2"
                placeholder="New password"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={account.confirmPassword}
                onChange={handleAccountChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-6 py-2 rounded font-semibold"
            >
              Update Account
            </button>
            <div className="pt-4">
              <button
                type="button"
                className="text-red-600 font-semibold underline"
                onClick={() => alert("Account deletion logic goes here")}
              >
                Delete Account
              </button>
            </div>
          </form>
        )}

        {selectedTab === "notifications" && (
          <form className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="email"
                checked={notifications.email}
                onChange={handleNotificationsChange}
                id="notif-email"
              />
              <label htmlFor="notif-email" className="font-semibold">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="push"
                checked={notifications.push}
                onChange={handleNotificationsChange}
                id="notif-push"
              />
              <label htmlFor="notif-push" className="font-semibold">
                Push Notifications
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="newsletter"
                checked={notifications.newsletter}
                onChange={handleNotificationsChange}
                id="notif-newsletter"
              />
              <label htmlFor="notif-newsletter" className="font-semibold">
                Newsletter Subscription
              </label>
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-6 py-2 rounded font-semibold"
            >
              Save Notification Settings
            </button>
          </form>
        )}

        {selectedTab === "privacy" && (
          <form className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Privacy Settings</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="profileVisible"
                checked={privacy.profileVisible}
                onChange={handlePrivacyChange}
                id="privacy-visible"
              />
              <label htmlFor="privacy-visible" className="font-semibold">
                Profile Visible to Others
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="showOnline"
                checked={privacy.showOnline}
                onChange={handlePrivacyChange}
                id="privacy-online"
              />
              <label htmlFor="privacy-online" className="font-semibold">
                Show Online Status
              </label>
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-6 py-2 rounded font-semibold"
            >
              Save Privacy Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
