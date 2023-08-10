import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QueueActions, QueueState } from './types';
import {
  clearQueue,
  playNext,
  playPlaylist,
  playPrev,
  playSong,
  setCurrentTime,
  setCurrentlyPlayingId,
  setIsPlaying,
  setQueue,
  setRepeat,
  setShuffle,
  setVolume,
} from './actions';

export const initialState: QueueState = {
  queueId: null,
  items: [],
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  repeatMode: 'NONE',
  shuffle: false,
  currentlyPlayingId: null,
  playlistId: null,
};

export const useQueueStore = create<QueueState & QueueActions>()(
  persist(
    set => ({
      ...initialState,
      setQueue: queue => set(setQueue(queue)),
      setIsPlaying: isPlaying => set(setIsPlaying(isPlaying)),
      playNext: () => set(playNext),
      playPrev: () => set(playPrev),
      playPlaylist: (playlist, songId) => set(playPlaylist(playlist, songId)),
      playSong: (song, songs) => set(playSong(song, songs)),
      setCurrentlyPlayingId: id => set(setCurrentlyPlayingId(id)),
      setCurrentTime: time => set(setCurrentTime(time)),
      setVolume: volume => set(setVolume(volume)),
      setShuffle: shuffle => set(setShuffle(shuffle)),
      setRepeat: repeat => set(setRepeat(repeat)),
      clearQueue: () => set(clearQueue),
      resetState: () => set(initialState)
    }),
    {
      name: 'queue-store',
      partialize: state => ({
        volume: state.volume,
      }),
    }
  )
);
