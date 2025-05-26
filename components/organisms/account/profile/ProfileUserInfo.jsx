'use client';

import React from 'react';
import Button from '@/components/atoms/form/Button';
import { cn } from '@/lib/utils';
import { roboto_900 } from '@/lib/config/font.config';
const ProfileUserInfo = ({ user }) => {
    return (
        <div className="pt-16 px-6 pb-6">
                <div className='flex justify-between items-center gap-4 pb-3'>
                    <h1 className={cn("text-3xl font-bold", roboto_900)}>{user?.name}</h1>
                    <Button outlined round className="text-sm px-6 py-2">
                        Edit Profile
                    </Button>
                </div>
                <div>
                    <div className='flex flex-row gap-4 items-center text-md font-extralight pb-3'>
                        <p className="text-sm">Country: {user?.country}</p>
                        <p className="text-sm">Country: {user?.country}</p>
                        <p className="text-sm">Age: {user?.age}</p> 
                        <p className="text-sm">Gender: {user?.gender}</p>
                        <p className="text-sm">Language: {user?.language}</p>
                        <p className="text-sm">Interests: {user?.interests?.join(', ') || "No interests"}</p>
                    </div>
                    <p className="mt-2 text-md w-full">{user?.bio || "No bio"}</p>
            </div>
        </div>
    );
};

export default ProfileUserInfo;

