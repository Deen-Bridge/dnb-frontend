'use client';

import React, { useEffect, useMemo, useRef } from 'react';

const getNormalizedDomain = (domain = 'meet.jit.si') =>
    domain.replace(/^https?:\/\//i, '').replace(/\/+$/g, '');

const loadExternalApi = (domain) =>
    new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window is undefined'));
            return;
        }

        if (window.JitsiMeetExternalAPI) {
            resolve();
            return;
        }

        const normalizedDomain = getNormalizedDomain(domain);
        const script = document.createElement('script');
        script.src = `https://${normalizedDomain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
    });

const JitsiMeetComponent = ({
    roomName,
    displayName = 'Guest User',
    domain = 'meet.jit.si',
    height = '80vh',
    onReadyToClose,
    className,
    jwt,
    requiresJwt = false,
}) => {
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const normalizedDomain = useMemo(() => getNormalizedDomain(domain), [domain]);

    useEffect(() => {
        if (!roomName || typeof window === 'undefined') return undefined;
        if (requiresJwt && !jwt) return undefined;

        let isMounted = true;

        const initializeMeeting = async () => {
            try {
                await loadExternalApi(normalizedDomain);

                if (!isMounted || !containerRef.current || !window.JitsiMeetExternalAPI) {
                    return;
                }

                containerRef.current.innerHTML = '';

                const options = {
                    roomName,
                    parentNode: containerRef.current,
                    width: '100%',
                    height: '100%',
                    userInfo: {
                        displayName,
                    },
                    configOverwrite: {
                        prejoinPageEnabled: false,
                        startWithAudioMuted: true,
                        startWithVideoMuted: false,
                    },
                    interfaceConfigOverwrite: {
                        DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_POWERED_BY: false,
                        SHOW_CHROME_EXTENSION_BANNER: false,
                        SUPPORT_URL: 'https://deenbridge.com/support',
                    },
                };

                if (jwt) {
                    options.jwt = jwt;
                }

                const api = new window.JitsiMeetExternalAPI(normalizedDomain, options);

                apiRef.current = api;

                const handleReadyToClose = () => {
                    apiRef.current?.dispose();
                    apiRef.current = null;
                    onReadyToClose?.();
                };

                api.addEventListener('readyToClose', handleReadyToClose);

                return () => {
                    api.removeEventListener('readyToClose', handleReadyToClose);
                };
            } catch (error) {
                console.error('Failed to initialize Jitsi meeting:', error);
            }
        };

        initializeMeeting();

        return () => {
            isMounted = false;
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, [roomName, displayName, normalizedDomain, onReadyToClose, jwt, requiresJwt]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                height,
                marginTop: '1rem',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#0a0f14',
            }}
        />
    );
};

export default JitsiMeetComponent;
