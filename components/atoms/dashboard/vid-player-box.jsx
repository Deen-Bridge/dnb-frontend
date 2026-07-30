'use client';

import { useEffect, useMemo, useState } from 'react';
import { VideoOff, Keyboard } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function PlayerProgressTracker({ onTimeUpdate, onEnded }) {
  const player = useMediaPlayer();

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

const KEYBOARD_SHORTCUTS = [
  { keys: 'Space / K', action: 'Play / pause' },
  { keys: '← / J', action: 'Seek back 10s' },
  { keys: '→ / L', action: 'Seek forward 10s' },
  { keys: '↑ / ↓', action: 'Volume up / down' },
  { keys: 'M', action: 'Mute / unmute' },
  { keys: 'F', action: 'Fullscreen' },
  { keys: 'C', action: 'Toggle captions' },
  { keys: 'I', action: 'Picture-in-picture' },
  { keys: '< / >', action: 'Slow down / speed up' },
];

function KeyboardShortcutsHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Keyboard shortcuts"
          className="absolute top-2 right-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white/90 hover:bg-black/70 hover:text-white transition-colors"
        >
          <Keyboard className="w-4 h-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 text-sm">
        <p className="font-semibold mb-2">Keyboard shortcuts</p>
        <ul className="space-y-1">
          {KEYBOARD_SHORTCUTS.map(({ keys, action }) => (
            <li key={keys} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{action}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

const RATE_KEY = 'dnb:player:rate';
const VOLUME_KEY = 'dnb:player:volume';
const MUTED_KEY = 'dnb:player:muted';

// Persists playback rate + volume/muted globally so a learner's chosen
// speed carries across courses. Deliberately leaves getTime/setTime
// unimplemented — resume/progress persistence is handled separately by
// issue #108's useCourseProgress hook (via the startTime/onTimeUpdate/
// onEnded props below), not through this storage adapter.
const playbackPreferencesStorage = {
  async getVolume() {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(VOLUME_KEY);
    return v !== null ? Number(v) : null;
  },
  async setVolume(volume) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  },
  async getMuted() {
    if (typeof window === 'undefined') return null;
    const m = window.localStorage.getItem(MUTED_KEY);
    return m !== null ? m === 'true' : null;
  },
  async setMuted(muted) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(MUTED_KEY, String(muted));
  },
  async getPlaybackRate() {
    if (typeof window === 'undefined') return null;
    const r = window.localStorage.getItem(RATE_KEY);
    return r !== null ? Number(r) : null;
  },
  async setPlaybackRate(rate) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RATE_KEY, String(rate));
  },
  async getTime() {
    return null;
  },
  async getLang() {
    return null;
  },
  async getCaptions() {
    return null;
  },
  async getVideoQuality() {
    return null;
  },
  async getAudioGain() {
    return null;
  },
};

// WebVTT cues require a finite end time (the spec/browser rejects
// Infinity/NaN), so the last chapter in an array without an explicit
// endTime gets this large-but-finite sentinel instead. Vidstack clamps
// the displayed/usable range against the real video duration anyway.
const FAR_FUTURE_END_TIME = 24 * 60 * 60; // 24 hours, in seconds

// Builds a `chapters` Track from either a chapters VTT URL (string) or
// an array of { startTime, endTime, text } cues. Returns null when no
// chapter data is present so the UI degrades gracefully.
function useChaptersTrack(chapters) {
  return useMemo(() => {
    if (!chapters) return null;

    if (typeof chapters === 'string') {
      return { kind: 'chapters', src: chapters, default: true };
    }

    if (Array.isArray(chapters) && chapters.length > 0) {
      const cues = chapters.map((chapter, index) => {
        const startTime = chapter.startTime ?? chapter.start ?? 0;
        const nextStart = chapters[index + 1]?.startTime ?? chapters[index + 1]?.start;
        // No explicit endTime and no next chapter (last one): extend to
        // the end of the video instead of guessing an arbitrary duration.
        const endTime = chapter.endTime ?? chapter.end ?? nextStart ?? FAR_FUTURE_END_TIME;
        return {
          startTime,
          endTime,
          text: chapter.text ?? chapter.title ?? `Chapter ${index + 1}`,
        };
      });
      return { kind: 'chapters', default: true, content: { cues } };
    }

    return null;
  }, [chapters]);
}

function PlayerErrorState({ message, thumbnail }) {
  return (
    <div
      role="alert"
      className="relative w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl bg-black text-white overflow-hidden"
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <VideoOff className="w-8 h-8 text-white/70" aria-hidden="true" />
        <p className="text-sm text-white/80">{message}</p>
      </div>
    </div>
  );
}

const VidPlayerBox = ({ data, startTime, onTimeUpdate, onEnded }) => {
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Reset a stale error when the video source changes (e.g. navigating
  // to a different lesson/course), otherwise the error state would
  // persist across an otherwise-working video.
  useEffect(() => {
    setHasPlaybackError(false);
  }, [data?.video]);

  const textTracks = data?.subtitles?.length
    ? data.subtitles
    : [];

  const chaptersTrack = useChaptersTrack(data?.chapters);

  if (!data?.video) {
    return (
      <PlayerErrorState
        message="This lesson's video is unavailable."
        thumbnail={data?.thumbnail}
      />
    );
  }

  if (hasPlaybackError) {
    return (
      <PlayerErrorState
        message="We couldn't load this video. Please try again later."
        thumbnail={data?.thumbnail}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <KeyboardShortcutsHelp />
      <MediaPlayer
        key={JSON.stringify({ video: data.video, subtitles: data.subtitles, chapters: data.chapters })}
        src={data.video}
        viewType='video'
        streamType='on-demand'
        logLevel='warn'
        playsInline
        title={data?.title}
        poster={data?.thumbnail}
        clipStartTime={startTime || undefined}
        storage={playbackPreferencesStorage}
        onError={() => setHasPlaybackError(true)}
        tabIndex={0}
        aria-label={data?.title ? `Video player: ${data.title}` : 'Video player'}
      >
        <MediaProvider>
          <Poster className="vds-poster" />
          {textTracks.map((track) => (
            <Track key={track.src} {...track} />
          ))}
          {chaptersTrack && <Track key="chapters" {...chaptersTrack} />}
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
