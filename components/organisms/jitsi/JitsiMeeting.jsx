import { JaaSMeeting, JitsiMeeting } from '@jitsi/react-sdk';
import React, { useRef, useState } from 'react';

const App = () => {
    const apiRef = useRef();
    const [logItems, updateLog] = useState([]);
    const [showNew, toggleShowNew] = useState(false);
    const [knockingParticipants, updateKnockingParticipants] = useState([]);

    const printEventOutput = payload => {
        updateLog(items => [...items, JSON.stringify(payload)]);
    };

    const handleAudioStatusChange = (payload, feature) => {
        if (payload.muted) {
            updateLog(items => [...items, `${feature} off`])
        } else {
            updateLog(items => [...items, `${feature} on`])
        }
    };

    const handleChatUpdates = payload => {
        if (payload.isOpen || !payload.unreadCount) {
            return;
        }
        apiRef.current.executeCommand('toggleChat');
        updateLog(items => [...items, `you have ${payload.unreadCount} unread messages`])
    };

    const handleKnockingParticipant = payload => {
        updateLog(items => [...items, JSON.stringify(payload)]);
        updateKnockingParticipants(participants => [...participants, payload?.participant])
    };

    const resolveKnockingParticipants = condition => {
        knockingParticipants.forEach(participant => {
            apiRef.current.executeCommand('answerKnockingParticipant', participant?.id, condition(participant));
            updateKnockingParticipants(participants => participants.filter(item => item.id === participant.id));
        });
    };

    const handleJitsiIFrameRef1 = iframeRef => {
        iframeRef.style.border = '10px solid #3d3d3d';
        iframeRef.style.background = '#3d3d3d';
        iframeRef.style.height = '400px';
        iframeRef.style.marginBottom = '20px';
    };

    const handleJitsiIFrameRef2 = iframeRef => {
        iframeRef.style.marginTop = '10px';
        iframeRef.style.border = '10px dashed #df486f';
        iframeRef.style.padding = '5px';
        iframeRef.style.height = '400px';
    };

    const handleJaaSIFrameRef = iframeRef => {
        iframeRef.style.border = '10px solid #3d3d3d';
        iframeRef.style.background = '#3d3d3d';
        iframeRef.style.height = '400px';
        iframeRef.style.marginBottom = '20px';
    };

    const handleApiReady = apiObj => {
        apiRef.current = apiObj;
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
        apiRef.current.on('audioMuteStatusChanged', payload => handleAudioStatusChange(payload, 'audio'));
        apiRef.current.on('videoMuteStatusChanged', payload => handleAudioStatusChange(payload, 'video'));
        apiRef.current.on('raiseHandUpdated', printEventOutput);
        apiRef.current.on('titleViewChanged', printEventOutput);
        apiRef.current.on('chatUpdated', handleChatUpdates);
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
    };

    const handleReadyToClose = () => {
        /* eslint-disable-next-line no-alert */
        alert('Ready to close...');
    };

    const generateRoomName = () => `JitsiMeetRoomNo${Math.random() * 100}-${Date.now()}`;

    // Multiple instances demo
    const renderNewInstance = () => {
        if (!showNew) {
            return null;
        }

        return (
            <JitsiMeeting
                roomName={generateRoomName()}
                getIFrameRef={handleJitsiIFrameRef2} />
        );
    };

    const renderButtons = () => (
        <div style={{ margin: '15px 0' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    type='text'
                    title='Click to execute toggle raise hand command'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#f8ae1a',
                        color: '#040404',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => apiRef.current.executeCommand('toggleRaiseHand')}>
                    Raise hand
                </button>
                <button
                    type='text'
                    title='Click to approve/reject knocking participant'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => resolveKnockingParticipants(({ name }) => !name.includes('test'))}>
                    Resolve lobby
                </button>
                <button
                    type='text'
                    title='Click to execute subject command'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#df486f',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => apiRef.current.executeCommand('subject', 'New Subject')}>
                    Change subject
                </button>
                <button
                    type='text'
                    title='Click to create a new JitsiMeeting instance'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#3D3D3D',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => toggleShowNew(!showNew)}>
                    Toggle new instance
                </button>
            </div>
        </div>
    );

    const renderLog = () => logItems.map(
        (item, index) => (
            <div
                style={{
                    fontFamily: 'monospace',
                    padding: '5px'
                }}
                key={index}>
                {item}
            </div>
        )
    );

    const renderSpinner = () => (
        <div style={{
            fontFamily: 'sans-serif',
            textAlign: 'center'
        }}>
            Loading..
        </div>
    );


    return (
        <>
            <h1 style={{
                fontFamily: 'sans-serif',
                textAlign: 'center'
            }}>
                JitsiMeeting Demo App
            </h1>
            <JitsiMeeting
                roomName={generateRoomName()}
                spinner={renderSpinner}
                configOverwrite={{
                    subject: 'lalalala',
                    hideConferenceSubject: false
                }}
                lang='de'
                onApiReady={externalApi => handleApiReady(externalApi)}
                onReadyToClose={handleReadyToClose}
                getIFrameRef={handleJitsiIFrameRef1} />
            <JaaSMeeting
                roomName={generateRoomName()}

                // Update this with the `8x8.vc` or `stage.8x8.vc` version of interest
                // and avoid mixing up different domains and release versions
                // on the same page at the same time, as only the first
                // external api script will be loaded.
                // release = 'release-1234'

                useStaging={true}
                getIFrameRef={handleJaaSIFrameRef} />
            {renderButtons()}
            {renderNewInstance()}
            {renderLog()}
        </>
    );
};

export default App;