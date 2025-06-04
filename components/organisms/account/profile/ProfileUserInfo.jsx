'use client';

import React from 'react';
import Button from '@/components/atoms/form/Button';
import { cn } from '@/lib/utils';
import { roboto_900 } from '@/lib/config/font.config';
import {useAuth} from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
const ProfileUserInfo = ({ user }) => {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const handleStartConversation = async () => {
        console.log("Starting conversation with user:", user?._id);
        console.log("Current user ID:", currentUser?._id);
        try {
            const { data } = await axios.post("http://localhost:5000/api/messages/conversation", {
                userId1: currentUser?._id,
                userId2: user?._id,
            });

            if (!data || !data.conversationId) {
                throw new Error("Conversation ID not returned from server");
            }

            router.push(`/dashboard/messages/${data.conversationId}`);
        } catch (err) {
            console.error("Error starting conversation:", err);
            alert("Failed to start conversation. Please try again.");
        }
    };
      
    return (
        <div className="pt-16 px-6 pb-6">
                <div className='flex justify-between items-center gap-4 pb-3'>
                    <h1 className={cn("text-3xl font-bold", roboto_900)}>{user?.name}</h1>
                {currentUser?._id === user?._id ? (
                    <Button outlined round className="text-sm px-6 py-2">
                        Edit Profile
                    </Button>
                ) : (
                    <Button outlined round className="text-sm px-6 py-2" onClick={handleStartConversation}>
                        Message
                    </Button>
                )}
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

