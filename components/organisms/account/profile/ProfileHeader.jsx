"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileHeader = ({ avatar }) => {
  return (
    <div className="relative w-full">
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-secondary via-highlight to-accent">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-16 h-40 w-40 rounded-full bg-basic/20 blur-2xl" />
      </div>
      <div className="absolute -bottom-12 left-6">
        <Avatar className="h-28 w-28 border-4 border-surface-raised shadow-xl">
          <AvatarImage src={avatar} alt="profile-user-image" />
          <AvatarFallback className="bg-accent text-xl text-white">
            CN
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ProfileHeader;
