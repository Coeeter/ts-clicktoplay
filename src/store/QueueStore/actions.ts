import { Queue } from '@/lib/queue';
import { QueueState } from './types';
import { Playlist } from '@/lib/playlist';
import { SongId } from '@/lib/songs';
import { sortLinkedList } from '@/utils/linkedList';
import { createQueueItems, generateQueueItemId } from '@/lib/queue/helper';
import { RepeatMode } from '@prisma/client';
import { initialState } from './QueueStore';

const setQueue = (queue: Queue): Partial<QueueState> => {
  return {
    ...queue,
    queueId: queue.id,
  };
};

const setIsPlaying = (isPlaying: boolean): Partial<QueueState> => {
  return { isPlaying };
};

const setCurrentlyPlayingId = (
  currentlyPlayingId: string | null
): Partial<QueueState> => {
  fetch(`/api/queue`, {
    method: 'PUT',
    body: JSON.stringify({
      currentlyPlayingId,
    }),
  });
  return { currentlyPlayingId, currentTime: 0 };
};

const playNext = (state: QueueState): Partial<QueueState> => {
  const currentSong = state.items.find(
    item => item.id === state.currentlyPlayingId
  );
  if (!currentSong) return {};
  const nextSongId =
    currentSong?.nextId ?? state.repeatMode === 'ALL'
      ? state.items.find(item => !item.prevId)?.id ?? null
      : null;
  return setCurrentlyPlayingId(nextSongId);
};

const playPrev = (state: QueueState): Partial<QueueState> => {
  const currentSong = state.items.find(
    item => item.id === state.currentlyPlayingId
  );
  if (!currentSong) return {};
  const prevSongId =
    state.currentTime > 5000
      ? state.currentlyPlayingId
      : currentSong?.prevId ?? state.repeatMode === 'ALL'
      ? state.items.find(item => !item.nextId)?.id ?? null
      : null;
  return setCurrentlyPlayingId(prevSongId);
};

const playPlaylist = (
  playlist: Playlist,
  songId: SongId | null
): ((state: QueueState) => Partial<QueueState>) => {
  return (state: QueueState) => {
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
  };
};

const playSong = (
  song: SongId,
  songs: SongId[]
): ((state: QueueState) => Partial<QueueState>) => {
  return (state: QueueState) => {
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
      items: newItems,
      currentlyPlayingId: generateQueueItemId(state.queueId!, song),
      currentTime: 0,
      isPlaying: true,
    };
  };
};

const setCurrentTime = (currentTime: number): Partial<QueueState> => {
  return { currentTime };
};

const setVolume = (volume: number): Partial<QueueState> => {
  return { volume };
};

const setShuffle = (
  shuffle: boolean
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    const shuffled = [...state.items];
    if (shuffle) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    const lastIndex = shuffled.length - 1;
    const newItems = shuffle
      ? shuffled.map((item, index) => ({
          ...item,
          shuffledNextId: index === lastIndex ? null : shuffled[index + 1].id,
          shuffledPrevId: index === 0 ? null : shuffled[index - 1].id,
        }))
      : sortLinkedList(shuffled).map(item => ({
          ...item,
          shuffledNextId: null,
          shuffledPrevId: null,
        }));
    fetch(`/api/queue/shuffle`, {
      method: 'POST',
      body: JSON.stringify({
        shuffle: shuffle,
        newItems: newItems.map(item => item.songId),
      }),
    });
    return {
      shuffle,
      items: newItems,
    };
  };
};

const setRepeat = (repeat: RepeatMode): Partial<QueueState> => {
  fetch(`/api/queue/repeat`, {
    method: 'POST',
    body: JSON.stringify({
      repeatMode: repeat,
    }),
  });
  return { repeatMode: repeat };
};

const clearQueue = (): Partial<QueueState> => {
  fetch('/api/queue/clear', { method: 'POST' });
  return {
    ...initialState,
    queueId: initialState.queueId,
    volume: initialState.volume,
    repeatMode: initialState.repeatMode,
    shuffle: initialState.shuffle,
  };
};

export {
  setQueue,
  setIsPlaying,
  playNext,
  playPrev,
  playPlaylist,
  playSong,
  setCurrentlyPlayingId,
  setCurrentTime,
  setVolume,
  setShuffle,
  setRepeat,
  clearQueue,
};
