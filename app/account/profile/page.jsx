"use client";
import React, { useState } from "react";
import ProfileHeader from "@/components/organisms/account/profile/ProfileHeader";
import ProfileUserInfo from "@/components/organisms/account/profile/ProfileUserInfo";
import ProfileTabs from "@/components/organisms/account/profile/ProfileTabs";
import ProfileContent from "@/components/organisms/account/profile/ProfileContent";

const user = {
  name: "Ali Jamal",
  username: "@alijamal",
  bio: "Creative designer & frontend enthusiast. Building the future one pixel at a time.",
  avatar: "/images/img1.jpeg"
};

const page = () => {
  const [selectedTab, setSelectedTab] = useState("courses");

  return (
    <>
  
      <div className="min-h-screen bg-muted p-4">
        <ProfileHeader />
        <ProfileUserInfo user={user} />
        <ProfileTabs selectedTab={selectedTab} onChange={setSelectedTab} />
        <ProfileContent selectedTab={selectedTab} />
      </div>

    </>
  )
};
export default page;

