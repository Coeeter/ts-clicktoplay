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
  const hasNextSong = currentQueueItem?.[shuffle ? 'shuffledNextId' : 'nextId'] !== null || repeatMode === 'ALL';
  const hasPrevSong = currentQueueItem?.[shuffle ? 'shuffledPrevId' : 'prevId'] !== null || repeatMode === 'ALL';
  const percent = useCallback(() => {
    if (!currentSong) return 0;
    return (currentTime / currentSong.duration) * 100;
  }, [currentSong?.duration, currentTime])();

  const ref = useRef<ReactPlayer>(null);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    if (ref.current && userSeeking) {
      ref.current.seekTo(currentTime, 'seconds');
      setUserSeeking(false);
    }
    currentTimeRef.current = currentTime;
  }, [currentTime, userSeeking]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        return setIsPlaying(!isPlaying);
      }
      if (event.key === 'ArrowLeft') {
        setUserSeeking(true);
        return setCurrentTime(Math.max(currentTimeRef.current - 10, 0));
      }
      if (event.key === 'ArrowRight') {
        if (!currentSong) return;
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
  }, []);

  useEffect(() => {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      setUserSeeking(true);
      playPrev();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext(true));
    navigator.mediaSession.setActionHandler('stop', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      setUserSeeking(true);
      setCurrentTime(Math.max(currentTimeRef.current - 10, 0));
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (!currentSong) return;
      setUserSeeking(true);
      setCurrentTime(
        Math.min(currentTimeRef.current + 10, currentSong.duration)
      );
    });
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, []);

  useEffect(() => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong?.title ?? 'Unknown',
      artist: currentSong?.artist ?? 'Unknown',
      artwork: [
        {
          src: currentSong?.albumCover ?? '/album-cover.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [currentSong?.albumCover, currentSong?.artist, currentSong?.title]);

  if (!isMounted || !currentSong) return null;

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
          disabled={!hasPrevSong}
          onClick={() => {
            setUserSeeking(true);
            playPrev();
          }}
        >
          <MdSkipPrevious />
        </button>
        <button
          className="text-slate-300 hover:text-slate-100 transition-colors"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <MdPauseCircle size={40} /> : <MdPlayCircle size={40} />}
        </button>
        <button
          className="text-2xl text-slate-300/70 hover:text-slate-100 transition-colors disabled:text-slate-300/30"
          disabled={!hasNextSong}
          onClick={() => playNext(true)}
        >
          <MdSkipNext />
        </button>
        <button
          className={`text-lg transition-colors disabled:text-slate-300/30 relative ${
            shuffle ? 'text-blue-500' : 'text-slate-300/70 hover:text-slate-100'
          }`}
          onClick={() => setShuffle(!shuffle)}
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
          max={currentSong.duration}
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
          className={`w-full cursor-pointer appearance-none h-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:accent-current rounded-lg focus:outline-none`}
          style={{
            background: `linear-gradient(to right, #1D4ED8 ${percent}%, #374047 ${percent}%)`,
          }}
        />
        <div className="text-sm text-slate-300/50 text-center">
          {new Date(currentSong.duration * 1000)
            .toISOString()
            .substring(14, 19)}
        </div>
      </div>
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
    </div>
  );
};
