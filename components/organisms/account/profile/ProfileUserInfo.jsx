"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowersCount,
  getFollowingCount,
} from "@/hooks/useFollow";

import { joinOrCreateConversation } from "@/lib/actions/messages/joinRoom";

const ProfileUserInfo = ({ user }) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Check if current user is following the profile user and get counts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?._id || !user?._id || currentUser._id === user._id)
        return;

      try {
        const result = await checkIfFollowing(user._id);
        if (result.success) {
          setFollowing(result.isFollowing);
        }
      } catch (error) {
        console.log("Error checking follow status:", error);
      }
    };

    const getCounts = async () => {
      if (!user?._id) return;

      try {
        const [followersResult, followingResult] = await Promise.all([
          getFollowersCount(user._id),
          getFollowingCount(user._id),
        ]);

        if (followersResult.success) {
          setFollowersCount(followersResult.count || 0);
        }

        if (followingResult.success) {
          setFollowingCount(followingResult.count || 0);
        }
      } catch (error) {
        console.log("Error fetching counts:", error);
      }
    };

    checkFollowStatus();
    getCounts();
  }, [currentUser?._id, user?._id]);

  const handleStartConversation = async () => {
    if (!currentUser?._id || !user?._id) return;
    try {
      setLoading(true);
      const conversationId = await joinOrCreateConversation(
        currentUser._id,
        user._id
      );
      router.push(`/dashboard/messages/${conversationId}`);
    } catch (err) {
      console.log("Error starting conversation:", err);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser?._id || !user?._id) return;

    try {
      setFollowLoading(true);
      let result;

      if (following) {
        result = await unfollowUser(user._id);
      } else {
        result = await followUser(user._id);
      }

      if (result.success) {
        setFollowing(!following);
      } else {
        alert(result.message || "Failed to update follow status");
      }
    } catch (error) {
      console.log("Error toggling follow:", error);
      alert("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="px-4 pb-5 pt-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={cn(poppins_600, "text-2xl text-ink sm:text-3xl")}>
            {user?.name}
          </h1>
          {user?.role && (
            <span
              className={cn(
                poppins_500,
                "mt-1 inline-block rounded-full bg-secondary/10 px-3 py-0.5 text-xs capitalize text-accent"
              )}
            >
              {user.role}
            </span>
          )}
        </div>

        {currentUser?._id === user?._id ? (
          <Button to={"/profile-setup"} outlined round className="px-6 py-2 text-sm">
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              outlined
              round
              loading={loading}
              className="px-6 py-2 text-sm"
              onClick={handleStartConversation}
            >
              Message
            </Button>
            <Button
              outlined
              round
              loading={followLoading}
              className={cn(
                "px-6 py-2 text-sm",
                following && "bg-accent text-white hover:bg-highlight"
              )}
              onClick={handleFollowToggle}
            >
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-baseline gap-1.5">
          <span className={cn(poppins_600, "text-lg text-ink")}>
            {followersCount}
          </span>
          <span className={cn(poppins_400, "text-sm text-ink-muted")}>
            Followers
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn(poppins_600, "text-lg text-ink")}>
            {followingCount}
          </span>
          <span className={cn(poppins_400, "text-sm text-ink-muted")}>
            Following
          </span>
        </div>
      </div>

      <p className={cn(poppins_400, "mt-3 max-w-2xl leading-relaxed text-ink-muted")}>
        {user?.bio || "No bio yet."}
      </p>
    </div>
  );
};

export default ProfileUserInfo;
