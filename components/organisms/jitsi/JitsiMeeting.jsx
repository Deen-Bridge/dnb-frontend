import React, { useState } from 'react';
import Button from '@/components/atoms/form/Button';

const JaasMeetingComponent = ({ JitsiMeetRoomName }) => {
    const [showMeeting, setShowMeeting] = useState(false);

    const appId = "vpaas-magic-cookie-bfa1edbf763349e588b503c9e22d34c8";
    const jwt = "eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtYmZhMWVkYmY3NjMzNDllNTg4YjUwM2M5ZTIyZDM0YzgvNjllOWRmLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6ImNoYXQiLCJpYXQiOjE3NTA5NjAzOTcsImV4cCI6MTc1MDk2NzU5NywibmJmIjoxNzUwOTYwMzkyLCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtYmZhMWVkYmY3NjMzNDllNTg4YjUwM2M5ZTIyZDM0YzgiLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsIm91dGJvdW5kLWNhbGwiOnRydWUsInNpcC1vdXRib3VuZC1jYWxsIjpmYWxzZSwidHJhbnNjcmlwdGlvbiI6dHJ1ZSwicmVjb3JkaW5nIjp0cnVlLCJmbGlwIjpmYWxzZX0sInVzZXIiOnsiaGlkZGVuLWZyb20tcmVjb3JkZXIiOmZhbHNlLCJtb2RlcmF0b3IiOnRydWUsIm5hbWUiOiJicmlkZ2VkZWVuIiwiaWQiOiJnb29nbGUtb2F1dGgyfDEwNzUxODAxMjc2OTgzMzU5NDkxNCIsImF2YXRhciI6IiIsImVtYWlsIjoiYnJpZGdlZGVlbkBnbWFpbC5jb20ifX0sInJvb20iOiIqIn0.bsZKIYLUEdGsFehEHbXzAi8CCyOnjwTUl97x1GE73o0xIvVANPPSGvG1udyXCC7pbYPrtit3haAYUSEX8gOtJgBPBjBDI43cR7hD5M0kTU_0RhoRK9Rw8QzXsOtrb5ly8Zty4T3Xb7R7nRBy0p3hHs2N5TpAOAjRvd1KT1IMEVg9UVg8f0C1QorjFpEL-HGfX0Ijw1lL8PJNfFZIjPeDc_3a2jfa9G0L6QLNYoDCxr7BjgiwbwlwGahlSvzqUNydO0S0jXQgiWNjKS1gR1YdDxN5QIcEbA9cY6DjhsjKIPZcqYEh2Eon46dP60T3giQOSEQtNfsrbjHeCffaHhQ98Q"

    const openMeeting = () => {
        // Jaas meeting URL format
        const url = `https://${appId}.8x8.vc/${JitsiMeetRoomName}?jwt=${jwt}`;
        // Open in new tab and request fullscreen
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
            // Try to request fullscreen after a short delay (browser restrictions may apply)
            setTimeout(() => {
                win.document.body.requestFullscreen?.();
            }, 1000);
        }
    };

    return (
        <div>
            <Button
                round
                wide
                className="bg-accent text-white"
                onClick={openMeeting}
            >
                Start Meeting Now
            </Button>
        </div>
    );
};

export default JaasMeetingComponent;



