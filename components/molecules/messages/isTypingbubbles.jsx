'use client'
import React from 'react';


const IsTypingBubble = () => {

    const isOutgoing = false

    return (
        <div className={'flex justify-end mb-4 flex-row-reverse'}>
            <div className="chat-bubble bg-green-200- p-4 pl-8 pr-28 rounded-r-full rounded-bl-md inline-block">
                <div className="typing items-center flex height-[17px]">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    );
};

export default IsTypingBubble



