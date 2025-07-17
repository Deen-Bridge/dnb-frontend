import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { followUser, unfollowUser, checkIfFollowing } from "@/hooks/useFollow";
import { cn } from "@/lib/utils";

const UserCard = ({ user, showFollowButton = true }) => {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if current user is following this user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (
        !currentUser?._id ||
        !user?._id ||
        currentUser._id === user._id ||
        !showFollowButton
      )
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

    checkFollowStatus();
  }, [currentUser?._id, user?._id, showFollowButton]);

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
    <Card className="flex items-start gap-4 p-4 hover:shadow-md transition-shadow bg-accent text-white cursor-pointer">
      <Link
        href={`/account/profile/${user._id}`}
        className="flex items-center gap-4 flex-1"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar || "/images/man.jpg"} alt={user.name} />
          <AvatarFallback>
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <p className="text-sm ">{user.role || "Member"}</p>
        </div>
      </Link>
      {/* <div>
        {showFollowButton && currentUser?._id !== user?._id && (
          <Button
            outlined
            round
            loading={followLoading}
            className={cn(
              "text-sm px-4 py-2 whitespace-nowrap",
              following && "bg-accent text-white hover:bg-accent/90"
            )}
            onClick={handleFollowToggle}
          >
            {following ? "Following" : "Follow"}
          </Button>
        )}
      </div> */}
    </Card>
  );
};

export default UserCard;
