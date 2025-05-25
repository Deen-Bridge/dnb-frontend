'use client';

import React from 'react';
import Button from '@/components/atoms/form/Button';
import { cn } from '@/lib/utils';
import { roboto_900 } from '@/lib/config/font.config';
const ProfileUserInfo = ({ user }) => {
    return (
        <div className="pt-16 px-6 pb-6">
            <div className="gap-4">
                <div className='flex justify-between items-center gap-4'>
                    <h1 className={cn("text-2xl font-bold", roboto_900)}>{user?.name}</h1>
                    <Button outlined round className="text-sm px-6 py-2">
                      Edit Profile
                    </Button>
                    
                </div>
                <div>
                    <p className="text-sm">{user?.name}</p>
                    <p className="mt-2 text-sm w-full">{user?.bio || "No bio"}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileUserInfo;

