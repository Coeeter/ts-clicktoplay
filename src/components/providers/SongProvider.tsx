'use client';

import { Queue } from '@/lib/queue';
import { SongId } from '@/lib/songs';
import { sortLinkedList } from '@/utils/sortLinkedList';
import { Playlist } from '@prisma/client';
import { createContext, useContext, useEffect, useState } from 'react';

type SongContext = {
  queue: Queue;
  isPlaying: boolean;
  playSong: () => void;
  pauseSong: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  playPlaylist: (playlist: Playlist, songId: SongId | null) => void;
  playSearch: (query: string, songId: SongId, songs: SongId[]) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  volume: number;
  currentTime: number;
};

type SongProviderProps = {
  queue: Queue | null;
  children: React.ReactNode;
};

const SongContext = createContext<SongContext | null>(null);

export const SongProvider = ({ queue, children }: SongProviderProps) => {
  const [_queue, _setQueue] = useState<Queue | null>(
    queue
      ? {
          ...queue,
          items: sortLinkedList(queue.items),
        }
      : null
  );
  const [_isPlaying, _setIsPlaying] = useState(false);
  const [_volume, _setVolume] = useState(0);
  const [_currentTime, _setCurrentTime] = useState(0);

  const playSong = () => {
    _setIsPlaying(true);
  };

  const pauseSong = () => {
    _setIsPlaying(false);
  };

  const togglePlay = () => {
    _setIsPlaying(!_isPlaying);
  };

  const playNext = () => {
    _setQueue(_queue => {
      if (!_queue) return _queue;
      const next = _queue.items.find(
        item => item.id === _queue.currentlyPlayingId
      )?.nextId;
      if (next) {
        return {
          ..._queue,
          currentlyPlayingId: next,
        };
      }
      return _queue;
    });
  };

  const playPrev = () => {
    _setQueue(_queue => {
      if (!_queue) return _queue;
      const prev = _queue.items.find(
        item => item.id === _queue.currentlyPlayingId
      )?.prevId;
      if (prev) {
        return {
          ..._queue,
          currentlyPlayingId: prev,
        };
      }
      return _queue;
    });
  };

  const playPlaylist = (playlist: Playlist, songId: SongId | null) => {
    // TODO: Play playlist
  };

  const playSearch = (query: string, songId: SongId) => {
    // TODO: Play search
  };

  const seek = (time: number) => {
    _setCurrentTime(time);
  };

  const setVolume = (volume: number) => {
    _setVolume(volume);
  };

  useEffect(() => {
    //TODO: Update queue in db
  }, [queue]);

  return (
    <SongContext.Provider
      value={{
        queue: _queue,
        isPlaying: _isPlaying,
        playSong,
        pauseSong,
        togglePlay,
        playNext,
        playPrev,
        playPlaylist,
        playSearch,
        seek,
        setVolume,
        volume: _volume,
        currentTime: _currentTime,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const useSong = () => {
  const context = useContext(SongContext);
  if (context === undefined) {
    throw new Error('useSong must be used within a SongProvider');
  }
  return context;
};
