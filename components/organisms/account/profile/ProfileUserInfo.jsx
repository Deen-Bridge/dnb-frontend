"use client";

import React from "react";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { roboto_900 } from "@/lib/config/font.config";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { joinOrCreateConversation } from "@/lib/actions/messages/joinRoom";


const ProfileUserInfo = ({ user }) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const handleStartConversation = async () => {
    if (!currentUser?._id || !user?._id) return;
    try {
      const conversationId = await joinOrCreateConversation(currentUser._id, user._id);
      router.push(`/dashboard/messages/${conversationId}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      alert("Failed to start conversation. Please try again.");
    }
  };

  return (
    <div className="pt-16 px-6 pb-6">
      <div className="flex justify-between items-center gap-4 pb-3">
        <h1 className={cn("text-3xl sm:text-4xl font-bold", roboto_900)}>{user?.name}</h1>
        {currentUser?._id === user?._id ? (
          <Button to={"/profile-setup"} outlined round className="text-sm px-6 py-2">
            Edit Profile
          </Button>
        ) : (
          <Button
            outlined
            round
            className="text-sm px-6 py-2"
            onClick={handleStartConversation}
          >
            Message
          </Button>
        )}
      </div>
      <div>
        <div className="flex flex-row gap-4 items-center text-md font-stretch-125% pb-3">
          <p className="text-sm">Country: {user?.country}</p>
          <p className="text-sm">Age: {user?.age}</p>
          <p className="text-sm">Gender: {user?.gender}</p>
          <p className="text-sm">Language: {user?.language}</p>
          <p className="text-sm ">
            Interests: {user?.interests?.join(", ") || "No interests"}
          </p>
        </div>
        <p className="mt-2 text-md font-stretch-110% w-full">{user?.bio || "No bio"}</p>
      </div>
    </div>
  );
};

export default ProfileUserInfo;
