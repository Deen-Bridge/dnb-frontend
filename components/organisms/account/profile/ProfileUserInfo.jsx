"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { roboto_900 } from "@/lib/config/font.config";
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
    <div className="pt-16  pb-6">
      <div className="flex justify-between items-center gap-4 pb-3">
        <h1 className={cn("text-3xl sm:text-4xl font-bold", roboto_900)}>
          {user?.name}
        </h1>
        {currentUser?._id === user?._id ? (
          <Button
            to={"/profile-setup"}
            outlined
            round
            className="text-sm px-6 py-2"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button
              outlined
              round
              loading={loading}
              className="text-sm px-6 py-2"
              onClick={handleStartConversation}
            >
              Message
            </Button>
            <Button
              outlined
              round
              loading={followLoading}
              className={cn(
                "text-sm px-6 py-2",
                following && "bg-accent text-white hover:bg-accent/90"
              )}
              onClick={handleFollowToggle}
            >
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        )}
      </div>

      <div>
        {currentUser?._id !== user?._id ? (
          <div className="flex flex-row gap-4 items-center text-md font-light sm:font-stretch-125% pb-3">
            <p className="text-sm">Country: {user?.country}</p>
            <p className="text-sm">Age: {user?.age}</p>
            <p className="text-sm">Gender: {user?.gender}</p>
            <p className="text-sm">Language: {user?.language}</p>
            <p className="text-sm hidden sm:block">
              Interests: {user?.interests?.join(", ") || "No interests"}
            </p>
          </div>
        ) : (
          ""
        )}

        {/* Follower/Following Stats */}
        {/* <div className="flex flex-row gap-6 mb-3">
          <div className="flex text-center">
            <span className="text-lg font-semibold text-accent">
              {followersCount}
            </span>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>

          <div className="flex text-center">
            <span className="text-lg font-semibold text-accent">
              {followingCount}
            </span>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div> */}

        <p className="mt-2 text-md font-stretch-110% w-full">
          {user?.bio || "No bio"}
        </p>
      </div>
    </div>
  );
};

export default ProfileUserInfo;
