'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';

const VidPlayerBox = ({ data }) => {
  const textTracks = [
    {
      kind: 'subtitles',
      src: 'https://files.vidstack.io/sprite-fight/subtitles-en.vtt',
      label: 'English',
      srclang: 'en',
      default: true,
    },
  ];

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
      >
        <MediaProvider>
          <Poster className="vds-poster" />
          {textTracks.map((track) => (
            <Track key={track.src} {...track} />
          ))}
        </MediaProvider>

        <DefaultVideoLayout
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
    </div>
  );
};

export default VidPlayerBox;
