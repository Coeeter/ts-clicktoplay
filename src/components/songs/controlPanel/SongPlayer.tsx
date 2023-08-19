'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { Song } from '@prisma/client';
import ReactPlayer from 'react-player';
import {
  MdPauseCircle,
  MdPlayCircle,
  MdSkipNext,
  MdSkipPrevious,
  MdShuffle,
} from 'react-icons/md';
import { TbRepeat, TbRepeatOnce } from 'react-icons/tb';
import { useCallback, useEffect, useRef, useState } from 'react';

type SongPlayerProps = {
  songs: Song[];
};

export const SongPlayer = ({ songs }: SongPlayerProps) => {
  const isMounted = useMounted();
  const [userSeeking, setUserSeeking] = useState(false);
  const [isUserDragging, setIsUserDragging] = useState(false);

  const isPlaying = useQueueStore(state => state.isPlaying);
  const currentTime = useQueueStore(state => state.currentTime);
  const volume = useQueueStore(state => state.volume);
  const repeatMode = useQueueStore(state => state.repeatMode);
  const shuffle = useQueueStore(state => state.shuffle);
  const currentQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );

  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const setCurrentTime = useQueueStore(state => state.setCurrentTime);
  const playNext = useQueueStore(state => state.playNext);
  const playPrev = useQueueStore(state => state.playPrev);
  const setRepeatMode = useQueueStore(state => state.setRepeat);
  const setShuffle = useQueueStore(state => state.setShuffle);

  const currentSong = songs.find(song => song.id === currentQueueItem?.songId);
  const nextSongKey = shuffle ? 'shuffledNextId' : 'nextId';
  const prevSongKey = shuffle ? 'shuffledPrevId' : 'prevId';
  const hasNextSong = currentQueueItem?.[nextSongKey] || repeatMode === 'ALL';
  const hasPrevSong = currentQueueItem?.[prevSongKey] || repeatMode === 'ALL';
  const disabled = !currentSong || !isMounted;
  const percent = useCallback(() => {
    if (!currentSong) return 0;
    return (currentTime / currentSong.duration) * 100;
  }, [currentSong?.duration, currentTime])();

  const ref = useRef<ReactPlayer>(null);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.forceUpdate();
  }, [disabled]);

  useEffect(() => {
    if (ref.current && userSeeking) {
      ref.current.seekTo(currentTime, 'seconds');
      setUserSeeking(false);
    }
    currentTimeRef.current = currentTime;
  }, [currentTime, userSeeking]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === ' ') {
        event.preventDefault();
        return setIsPlaying(!isPlaying);
      }
      if (event.key === 'ArrowLeft') {
        if (!currentSong) return;
        event.preventDefault();
        setUserSeeking(true);
        return setCurrentTime(Math.max(currentTimeRef.current - 10, 0));
      }
      if (event.key === 'ArrowRight') {
        if (!currentSong) return;
        event.preventDefault();
        setUserSeeking(true);
        return setCurrentTime(
          Math.min(currentTimeRef.current + 10, currentSong?.duration)
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const actionHandles = getActionHandles(
      setIsPlaying,
      playPrev,
      playNext,
      setUserSeeking,
      setCurrentTime,
      currentTimeRef,
      currentSong
    );

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    actionHandles.forEach(({ action, callback }) => {
      navigator.mediaSession.setActionHandler(action, callback);
    });

    return () => {
      navigator.mediaSession.playbackState = 'none';
      actionHandles.forEach(({ action }) => {
        navigator.mediaSession.setActionHandler(action, null);
      });
    };
  }, [currentSong, isPlaying]);

  useEffect(() => {
    navigator.mediaSession.metadata = getMetadata(currentSong);
    return () => {
      navigator.mediaSession.metadata = null;
    }
  }, [currentSong])

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="flex gap-3">
        <button
          className={`text-lg transition-colors disabled:text-slate-300/30 relative ${
            repeatMode === 'NONE'
              ? 'text-slate-300/70 hover:text-slate-100'
              : 'text-blue-500'
          }`}
          onClick={() => {
            setRepeatMode(
              repeatMode === 'NONE'
                ? 'ALL'
                : repeatMode === 'ALL'
                ? 'ONE'
                : 'NONE'
            );
          }}
          disabled={disabled}
        >
          {repeatMode === 'ALL' || repeatMode === 'NONE' ? (
            <TbRepeat />
          ) : (
            <TbRepeatOnce />
          )}
          {repeatMode === 'NONE' || (
            <div className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>
        <button
          className="text-2xl text-slate-300/70 hover:text-slate-100 transition-colors disabled:text-slate-300/30"
          disabled={!hasPrevSong || disabled}
          onClick={() => {
            setUserSeeking(true);
            playPrev();
          }}
        >
          <MdSkipPrevious />
        </button>
        <button
          className="text-slate-300 hover:text-slate-100 transition-colors disabled:text-slate-300/30"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={disabled}
        >
          {isPlaying ? <MdPauseCircle size={40} /> : <MdPlayCircle size={40} />}
        </button>
        <button
          className="text-2xl text-slate-300/70 hover:text-slate-100 transition-colors disabled:text-slate-300/30"
          disabled={!hasNextSong || disabled}
          onClick={() => playNext(true)}
        >
          <MdSkipNext />
        </button>
        <button
          className={`text-lg transition-colors disabled:text-slate-300/30 relative ${
            shuffle ? 'text-blue-500' : 'text-slate-300/70 hover:text-slate-100'
          }`}
          onClick={() => setShuffle(!shuffle)}
          disabled={disabled}
        >
          <MdShuffle />
          {shuffle && (
            <div className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>
      </div>
      <div className="w-full flex items-center gap-3">
        <div className="text-sm text-slate-300/50 text-center">
          {new Date(currentTime * 1000).toISOString().substring(14, 19)}
        </div>
        <input
          type="range"
          min={0}
          max={currentSong?.duration}
          disabled={disabled}
          value={currentTime}
          onChange={e => setCurrentTime(parseInt(e.target.value))}
          onMouseDown={() => setIsUserDragging(true)}
          onTouchStart={() => setIsUserDragging(true)}
          onMouseUp={() => {
            setUserSeeking(true);
            setIsUserDragging(false);
          }}
          onTouchEnd={() => {
            setUserSeeking(true);
            setIsUserDragging(false);
          }}
          className={`w-full cursor-pointer appearance-none h-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:accent-current rounded-lg focus:outline-none disabled:cursor-default`}
          style={{
            background: `linear-gradient(to right, #1D4ED8 ${percent}%, #374047 ${percent}%)`,
          }}
        />
        <div className="text-sm text-slate-300/50 text-center">
          {disabled
            ? '00:00'
            : new Date(currentSong.duration * 1000)
                .toISOString()
                .substring(14, 19)}
        </div>
      </div>
      {disabled ? null : (
        <ReactPlayer
          ref={ref}
          url={currentSong.url}
          playing={isPlaying}
          onEnded={() => {
            if (repeatMode === 'ONE') setUserSeeking(true);
            playNext();
          }}
          onProgress={e => {
            if (isUserDragging) return;
            setCurrentTime(e.playedSeconds);
          }}
          volume={volume / 100}
          width="0%"
          height="0%"
        />
      )}
    </div>
  );
};

function getMetadata(currentSong: Song | undefined): MediaMetadata | null {
  if (!currentSong) return null;
  return new MediaMetadata({
    title: currentSong?.title ?? 'Unknown',
    artist: currentSong?.artist ?? 'Unknown',
    artwork: [
      {
        src: currentSong?.albumCover ?? '/album-cover.png',
        sizes: '512x512',
        type: `image/${currentSong?.albumCover?.split('.').pop() ?? 'png'}`,
      },
    ],
  });
}

function getActionHandles(
  setIsPlaying: (isPlaying: boolean) => void,
  playPrev: (force?: boolean | undefined) => void,
  playNext: (force?: boolean | undefined) => void,
  setUserSeeking: (seeking: boolean) => void,
  setCurrentTime: (time: number) => void,
  currentTimeRef: React.MutableRefObject<number>,
  currentSong: Song | undefined
): { action: MediaSessionAction; callback: () => void }[] {
  return [
    {
      action: 'play',
      callback: () => setIsPlaying(true),
    },
    {
      action: 'pause',
      callback: () => setIsPlaying(false),
    },
    {
      action: 'previoustrack',
      callback: () => playPrev(true),
    },
    {
      action: 'nexttrack',
      callback: () => playNext(true),
    },
    {
      action: 'stop',
      callback: () => setIsPlaying(false),
    },
    {
      action: 'seekbackward',
      callback: () => {
        setUserSeeking(true);
        setCurrentTime(Math.max(currentTimeRef.current - 10, 0));
      },
    },
    {
      action: 'seekforward',
      callback: () => {
        setUserSeeking(true);
        setCurrentTime(
          Math.min(currentTimeRef.current + 10, currentSong!.duration)
        );
      },
    },
  ];
}
