import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addSongToQueue,
  clearQueue,
  playNext,
  playPlaylist,
  playPrev,
  playSong,
  removeSongFromQueue,
  reorderItems,
  setCurrentTime,
  setCurrentlyPlayingId,
  setIsPlaying,
  setNextSong,
  setQueue,
  setRepeat,
  setShuffle,
  setVolume,
} from './actions';
import { QueueActions, QueueState } from './types';

export const initialState: QueueState = {
  queueId: null,
  items: [],
  isPlaying: false,
  volume: 100,
  currentTime: 0,
  repeatMode: 'NONE',
  shuffle: false,
  currentlyPlayingId: null,
};

export const useQueueStore = create<QueueState & QueueActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setQueue: queue => set(setQueue(queue)),
      setIsPlaying: isPlaying => set(setIsPlaying(isPlaying)),
      playNext: force => set(playNext(force)),
      playPrev: force => set(playPrev(force)),
      playPlaylist: (playlist, songId) => {
        set(playPlaylist(playlist, songId, () => {
          get().setShuffle(get().shuffle);
        }));
      },
      playSong: (song, songs) => {
        set(playSong(song, songs, () => {
          get().setShuffle(get().shuffle);
        }));
      },
      setCurrentlyPlayingId: id => set(setCurrentlyPlayingId(id)),
      setCurrentTime: time => set(setCurrentTime(time)),
      setVolume: volume => set(setVolume(volume)),
      setShuffle: shuffle => set(setShuffle(shuffle)),
      setRepeat: repeat => set(setRepeat(repeat)),
      clearQueue: () => set(clearQueue),
      resetState: () => set(initialState),
      reorderItems: (...args) => set(reorderItems(...args)),
      addSongToQueue: songId => set(addSongToQueue(songId)),
      removeSongFromQueue: queueItemId => set(removeSongFromQueue(queueItemId)),
      setNextSong: (songId, path) => set(setNextSong(songId, path)),
    }),
    {
      name: 'queue-store',
      partialize: state => ({
        volume: state.volume,
      }),
    }
  )
);
