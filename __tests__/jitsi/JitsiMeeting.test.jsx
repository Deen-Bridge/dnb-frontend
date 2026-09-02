import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkMeetingMock = vi.fn();

vi.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: (props) => {
    sdkMeetingMock(props);
    return <iframe data-testid="jitsi-frame" ref={props.getIFrameRef} title="Jitsi meeting" />;
  },
}));

import JitsiMeetComponent from '@/components/organisms/jitsi/JitsiMeeting';

describe('JitsiMeetComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  it('uses the React SDK with a normalized domain and room settings', () => {
    render(
      <JitsiMeetComponent
        domain="https://meet.example.com/"
        roomName="space-42"
        displayName="Amina"
        jwt="signed-token"
      />
    );

    expect(sdkMeetingMock).toHaveBeenCalled();
    const props = sdkMeetingMock.mock.calls.at(-1)[0];
    expect(props.domain).toBe('meet.example.com');
    expect(props.roomName).toBe('space-42');
    expect(props.jwt).toBe('signed-token');
    expect(props.userInfo).toEqual({ displayName: 'Amina' });
    expect(screen.getByRole('status')).toHaveTextContent('Loading video room');
  });

  it('shows a retryable message when the SDK never becomes ready', () => {
    render(<JitsiMeetComponent roomName="space-42" />);

    act(() => vi.advanceTimersByTime(20000));

    expect(screen.getByRole('alert')).toHaveTextContent('video room could not be loaded');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByTestId('jitsi-frame')).toBeInTheDocument();
  });

  it('surfaces Jitsi connection errors instead of leaving an empty iframe', () => {
    render(<JitsiMeetComponent roomName="space-42" />);
    const api = { addEventListener: vi.fn(), dispose: vi.fn() };
    const props = sdkMeetingMock.mock.calls.at(-1)[0];

    act(() => props.onApiReady(api));
    const errorHandler = api.addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'errorOccurred'
    )[1];
    act(() => errorHandler({ name: 'conference.connectionError' }));

    expect(screen.getByRole('alert')).toHaveTextContent('could not connect to the meeting');
  });
});
