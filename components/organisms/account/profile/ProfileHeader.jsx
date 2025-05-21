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
            <div className="h-40 sm:h-48 w-full rounded-t-xl overflow-hidden bg-accent">
                <img
                    src="/images/auth.jpg"
                    alt="cover-image"
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="absolute -bottom-10 left-6">
                <Avatar className="h-24 sm:h-28 w-24 sm:w-28 border-4 border-background shadow-lg">
                    <AvatarImage src={avatar || "/images/man.jpg" } alt="profile-user-image" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
};

export default ProfileHeader;

