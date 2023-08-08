import { Playlist } from '@/lib/playlist';
import { Queue } from '@/lib/queue';
import { createQueueItems, generateQueueItemId } from '@/lib/queue/helper';
import { SongId } from '@/lib/songs';
import { sortLinkedList } from '@/utils/linkedList';
import { RepeatMode } from '@prisma/client';
import { create } from 'zustand';

type QueueState = Omit<Queue, 'id' | 'playlist'> & {
  queueId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
};

export type QueueActions = {
  setQueue: (queue: Queue) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  playPlaylist: (playlist: Playlist, songId: SongId | null) => void;
  playSong: (song: SongId, songs: SongId[]) => void;
  setCurrentlyPlayingId: (currentlyPlayingId: string) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: RepeatMode) => void;
  clearQueue: () => void;
};

const initialState: QueueState = {
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

export const useQueueStore = create<QueueState & QueueActions>(set => ({
  ...initialState,
  setQueue: queue => set({ ...queue, queueId: queue.id }),
  setIsPlaying: isPlaying => set({ isPlaying }),
  playNext: () => {
    set(state => {
      const currentSong = state.items.find(
        item => item.id === state.currentlyPlayingId
      );
      const nextSongId =
        currentSong?.nextId ?? state.repeatMode === 'ALL'
          ? state.items.find(item => !item.prevId)?.id
          : null;
      fetch(`/api/queue`, {
        method: 'PUT',
        body: JSON.stringify({
          currentlyPlayingId: nextSongId,
        }),
      });
      return {
        currentlyPlayingId: nextSongId,
        currentTime: 0,
      };
    });
  },
  playPrev: () => {
    set(state => {
      const currentSong = state.items.find(
        item => item.id === state.currentlyPlayingId
      );
      const prevSongId =
        state.currentTime > 5000
          ? state.currentlyPlayingId
          : currentSong?.prevId ?? state.repeatMode === 'ALL'
          ? state.items.find(item => !item.nextId)?.id
          : null;
      fetch(`/api/queue`, {
        method: 'PUT',
        body: JSON.stringify({
          currentlyPlayingId: prevSongId,
        }),
      });
      return {
        currentlyPlayingId: prevSongId,
        currentTime: 0,
      };
    });
  },
  playPlaylist: (playlist, songId) => {
    set(state => {
      const items = sortLinkedList(playlist.items);
      if (!state.queueId) {
        throw new Error('Must be logged in to play songs');
      }
      fetch(`/api/queue/playlist/${playlist.id}`, {
        method: 'POST',
        body: JSON.stringify({
          songId: songId ?? items[0].songId,
        }),
      });
      return {
        playlistId: playlist.id,
        playlist: playlist,
        items: createQueueItems(
          items.map(item => item.id),
          state.queueId!
        ).map(item => ({
          id: item.id!,
          prevId: item.prevId!,
          nextId: item.nextId!,
          songId: item.songId!,
          queueId: state.queueId!,
          shuffledNextId: null,
          shuffledPrevId: null,
        })),
        currentlyPlayingId: generateQueueItemId(
          state.queueId,
          songId ?? items[0].id
        ),
        currentTime: 0,
        isPlaying: true,
      };
    });
  },
  playSong: (song, songs) => {
    set(state => {
      if (!state.queueId) {
        throw new Error('Must be logged in to play songs');
      }
      const newItems = createQueueItems(songs, state.queueId!).map(item => ({
        id: item.id!,
        prevId: item.prevId!,
        nextId: item.nextId!,
        songId: item.songId!,
        queueId: state.queueId!,
        shuffledNextId: null,
        shuffledPrevId: null,
      }));
      fetch(`/api/queue/play`, {
        method: 'POST',
        body: JSON.stringify({
          songId: song,
          songs: sortLinkedList(newItems).map(item => item.songId),
        }),
      });
      return {
        playlistId: null,
        playlist: null,
        items: newItems,
        currentlyPlayingId: generateQueueItemId(state.queueId!, song),
        currentTime: 0,
        isPlaying: true,
      };
    });
  },
  setCurrentlyPlayingId: currentlyPlayingId => {
    fetch(`/api/queue`, {
      method: 'PUT',
      body: JSON.stringify({
        currentlyPlayingId,
      }),
    });
    set({
      currentlyPlayingId,
      currentTime: 0,
    });
  },
  setCurrentTime: time => {
    set({ currentTime: time });
  },
  setVolume: volume => {
    set({ volume });
  },
  setShuffle: shuffle => {
    set({ shuffle });
  },
  setRepeat: repeat => {
    set({ repeatMode: repeat });
  },
  clearQueue: () => {
    set({
      ...initialState,
      queueId: initialState.queueId,
      volume: initialState.volume,
      repeatMode: initialState.repeatMode,
      shuffle: initialState.shuffle,
    });
  },
}));
