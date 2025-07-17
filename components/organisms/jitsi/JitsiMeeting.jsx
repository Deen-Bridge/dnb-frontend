'use client';

import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/atoms/form/Button';

const JitsiMeetComponent = () => {
    const [showMeeting, setShowMeeting] = useState(false);
    const jitsiContainerRef = useRef(null);
    const [roomName] = useState(`openll-ddddfds-meeting-${Math.floor(Math.random() * 1e9)}`);

    useEffect(() => {
        if (!showMeeting || typeof window === 'undefined') return;

        const domain = 'meet.jit.si';

        const loadJitsiScript = () => {
            return new Promise((resolve) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = resolve;
                document.body.appendChild(script);
            });
        };

        loadJitsiScript().then(() => {
            const api = new window.JitsiMeetExternalAPI(domain, {
                roomName,
                parentNode: jitsiContainerRef.current,
                width: '100%',
                height: '100%',
                userInfo: {
                    displayName: 'Guest User',
                },
                configOverwrite: {
                    enableWelcomePage: false,
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                },
                interfaceConfigOverwrite: {
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                    SHOW_CHROME_EXTENSION_BANNER: false,
                },
            });

            // Clean up when component unmounts
            return () => api.dispose?.();
        });
    }, [showMeeting, roomName]);

    return (
        <div>
            {!showMeeting ? (
                <Button
                    round
                    wide
                    className="bg-accent text-white"
                    onClick={() => setShowMeeting(true)}
                >
                    Start Meeting Now
                </Button>
            ) : (
                <div
                    ref={jitsiContainerRef}
                    style={{
                        width: '100%',
                        height: '80vh',
                        marginTop: '1rem',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                />
            )}
        </div>
    );
};

export default JitsiMeetComponent;
