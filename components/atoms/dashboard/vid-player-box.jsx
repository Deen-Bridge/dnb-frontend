'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  useMediaPlayer,
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import { useEffect, useRef } from 'react';

function PlayerProgressTracker({ onTimeUpdate, onEnded }) {
  const player = useMediaPlayer();
  const lastReportRef = useRef(0);

  useEffect(() => {
    if (!player) return;

    const timeSub = player.on('time-update', (e) => {
      if (onTimeUpdate) {
        onTimeUpdate(e.currentTime, e.duration);
      }
    });

    const endedSub = player.on('ended', () => {
      if (onEnded) {
        onEnded();
      }
    });

    return () => {
      timeSub();
      endedSub();
    };
  }, [player, onTimeUpdate, onEnded]);

  return null;
}

const VidPlayerBox = ({ data, startTime, onTimeUpdate, onEnded }) => {
  const textTracks = data?.subtitles?.length
    ? data.subtitles
    : [];

  return (
    <div className="w-full h-full">
      <MediaPlayer
        src={data?.video}
        viewType='video'
        streamType='on-demand'
        logLevel='warn'
        playsInline
        title={data?.title}
        poster={data?.thumbnail}
        clipStartTime={startTime || undefined}
      >
        <MediaProvider>
          <Poster className="vds-poster" />
          {textTracks.map((track) => (
            <Track key={track.src} {...track} />
          ))}
        </MediaProvider>

        <DefaultVideoLayout
          thumbnails={data?.thumbnails || undefined}
          icons={defaultLayoutIcons}
        />

        <PlayerProgressTracker
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      </MediaPlayer>
    </div>
  );
};

export default VidPlayerBox;
