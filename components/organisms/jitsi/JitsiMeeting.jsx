'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const INITIALIZATION_TIMEOUT_MS = 20000;

const getNormalizedDomain = (domain = 'meet.jit.si') =>
  domain.replace(/^https?:\/\//i, '').replace(/\/+$/g, '');

const getErrorMessage = (error) => {
  const name = error?.name || error?.type;

  if (name === 'conference.connectionError' || name === 'CONNECTION_ERROR') {
    return 'We could not connect to the meeting. Check your connection and try again.';
  }

  return 'The video room could not be loaded. Please try again or open it in a new window.';
};

/**
 * Mounts Jitsi through its React SDK instead of manually injecting
 * external_api.js. The SDK owns script loading and iframe teardown, which
 * prevents duplicate-script races when a meeting is reopened.
 */
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
  const apiRef = useRef(null);
  const apiErrorListenerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const normalizedDomain = getNormalizedDomain(domain);

  const clearInitializationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showError = useCallback(
    (error) => {
      clearInitializationTimeout();
      setStatus('error');
      setErrorMessage(getErrorMessage(error));
    },
    [clearInitializationTimeout]
  );

  useEffect(() => {
    if (!roomName || (requiresJwt && !jwt)) return undefined;

    setStatus('loading');
    setErrorMessage('');
    timeoutRef.current = window.setTimeout(() => showError(), INITIALIZATION_TIMEOUT_MS);

    return () => {
      clearInitializationTimeout();
      if (apiRef.current && apiErrorListenerRef.current) {
        apiRef.current.removeEventListener?.('errorOccurred', apiErrorListenerRef.current);
      }
      apiRef.current = null;
      apiErrorListenerRef.current = null;
    };
  }, [attempt, roomName, normalizedDomain, jwt, requiresJwt, clearInitializationTimeout, showError]);

  const handleApiReady = useCallback(
    (api) => {
      apiRef.current = api;
      apiErrorListenerRef.current = showError;
      clearInitializationTimeout();
      setStatus('ready');
      api.addEventListener?.('errorOccurred', showError);
    },
    [clearInitializationTimeout, showError]
  );

  const handleReadyToClose = useCallback(() => {
    clearInitializationTimeout();
    apiRef.current = null;
    onReadyToClose?.();
  }, [clearInitializationTimeout, onReadyToClose]);

  const retry = useCallback(() => {
    apiRef.current?.dispose?.();
    apiRef.current = null;
    apiErrorListenerRef.current = null;
    setStatus('loading');
    setErrorMessage('');
    setAttempt((value) => value + 1);
  }, []);

  if (!roomName) {
    return (
      <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800" role="alert">
        This live session does not have a meeting room yet. Please contact the host.
      </div>
    );
  }

  if (requiresJwt && !jwt) {
    return (
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800" role="status">
        Preparing your secure meeting session...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-800" role="alert">
        <p>{errorMessage}</p>
        <button
          type="button"
          className="mt-3 rounded-md bg-red-700 px-3 py-2 font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={retry}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height,
        marginTop: '1rem',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#0a0f14',
      }}
    >
      <JitsiMeeting
        key={attempt}
        domain={normalizedDomain}
        roomName={roomName}
        jwt={jwt}
        userInfo={{ displayName }}
        configOverwrite={{
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        }}
        interfaceConfigOverwrite={{
          DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SUPPORT_URL: 'https://deenbridge.com/support',
        }}
        onApiReady={handleApiReady}
        onReadyToClose={handleReadyToClose}
        getIFrameRef={(iframe) => {
          if (iframe) {
            iframe.style.height = '100%';
            iframe.style.width = '100%';
          }
        }}
      />
      {status === 'loading' && (
        <div className="sr-only" role="status">Loading video room…</div>
      )}
    </div>
  );
};

export default JitsiMeetComponent;
