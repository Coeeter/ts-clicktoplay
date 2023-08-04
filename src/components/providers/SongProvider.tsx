'use client';
import { Playlist } from '@/lib/playlist';
import { Queue } from '@/lib/queue';
import { createQueueItems, generateQueueItemId } from '@/lib/queue/helper';
import { SongId } from '@/lib/songs';
import { sortLinkedList } from '@/utils/linkedList';
import { createContext, useContext, useEffect, useState } from 'react';

type SongContext = {
  queue: Queue;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  playPlaylist: (playlist: Playlist, songId: SongId | null) => void;
  playSong: (song: SongId, songs: SongId[]) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  volume: number;
  currentTime: number;
};

type SongProviderProps = {
  queue: Queue;
  children: React.ReactNode;
};

type QueueChange = 'next' | 'prev' | 'playlist' | 'custom';

const SongContext = createContext<SongContext | null>(null);

export const SongProvider = ({ queue, children }: SongProviderProps) => {
  const [_queue, _setQueue] = useState<Queue>({ ...queue });
  const [_isPlaying, _setIsPlaying] = useState(false);
  const [_volume, _setVolume] = useState(0);
  const [_currentTime, _setCurrentTime] = useState(0);
  const [_queueChange, _setQueueChange] = useState<QueueChange | null>(null);

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
    _setQueueChange('next');
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
    _setQueueChange('prev');
  };

  const playPlaylist = (playlist: Playlist, songId: SongId | null) => {
    const items = sortLinkedList(playlist.items);
    _setQueue(queue => ({
      ...queue,
      playlistId: playlist.id,
      playlist: playlist,
      items: createQueueItems(
        items.map(item => item.id),
        queue.id
      ).map(item => ({
        id: item.id!,
        prevId: item.prevId!,
        nextId: item.nextId!,
        songId: item.songId!,
        queueId: queue.id!,
      })),
      currentlyPlayingId: generateQueueItemId(
        queue.id,
        songId ?? items[0].songId
      ),
    }));
    _setQueueChange('playlist');
  };

  const playSong = (songId: SongId, songs: SongId[]) => {
    _setQueue(queue => ({
      ...queue,
      playlist: null,
      playlistId: null,
      currentlyPlayingId: generateQueueItemId(queue.id, songId),
      items: createQueueItems(songs, queue.id).map(item => ({
        id: item.id!,
        prevId: item.prevId!,
        nextId: item.nextId!,
        songId: item.songId!,
        queueId: queue.id!,
      })),
    }));
    _setQueueChange('custom');
  };

  const seek = (time: number) => {
    _setCurrentTime(time);
  };

  const setVolume = (volume: number) => {
    _setVolume(volume);
  };

  useEffect(() => {
    switch (_queueChange) {
      case 'next':
        fetch(`/api/queue/${_queue.id}/next`, {
          method: 'POST',
        });
        _setQueueChange(null);
        break;
      case 'prev':
        fetch(`/api/queue/${_queue.id}/prev`, {
          method: 'POST',
        });
        _setQueueChange(null);
        break;
      case 'playlist':
        fetch(`/api/queue/${_queue.id}/playlist/${_queue.playlistId}`, {
          method: 'POST',
          body: JSON.stringify({
            songId: _queue.currentlyPlayingId,
          }),
        });
        _setQueueChange(null);
        break;
      case 'custom':
        fetch(`/api/queue/${_queue.id}/play`, {
          method: 'POST',
          body: JSON.stringify({
            songId: _queue.currentlyPlayingId,
            songs: sortLinkedList(_queue.items).map(item => item.songId),
          }),
        });
        _setQueueChange(null);
        break;
      default:
        break;
    }
  }, [_queue, _queueChange]);

  return (
    <SongContext.Provider
      value={{
        queue: _queue,
        isPlaying: _isPlaying,
        setIsPlaying: _setIsPlaying,
        playNext,
        playPrev,
        playPlaylist,
        playSong,
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
  if (!context) {
    throw new Error('useSong must be used within a SongProvider');
  }
  return context;
};
