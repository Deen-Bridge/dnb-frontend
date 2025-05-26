'use client';

import React from 'react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

const ProfileHeader = ({ avatar }) => {
    return (
        <div className="relative w-full">
            <div className="bg-accent h-40 w-full rounded-t-xl" />
            <div className="absolute -bottom-10 left-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={avatar} alt="profile-user-image" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
};

export default ProfileHeader;

