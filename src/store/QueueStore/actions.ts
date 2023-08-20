import { Queue, QueueItemId } from '@/lib/queue';
import { QueueState } from './types';
import { Playlist } from '@/lib/playlist';
import { SongId } from '@/lib/songs';
import { sortLinkedList } from '@/utils/linkedList';
import { createQueueItems, generateQueueItemId } from '@/lib/queue/helper';
import { QueueItem, RepeatMode } from '@prisma/client';
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
  currentlyPlayingId: string
): Partial<QueueState> => {
  fetch(`/api/queue`, {
    method: 'PUT',
    body: JSON.stringify({
      currentlyPlayingId,
    }),
  });
  return { currentlyPlayingId, currentTime: 0 };
};

const playNext = (
  force: boolean = false
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    const currentSong = state.items.find(
      item => item.id === state.currentlyPlayingId
    );
    if (!currentSong) return {};
    const nextSongKey = state.shuffle ? 'shuffledNextId' : 'nextId';
    const prevSongKey = state.shuffle ? 'shuffledPrevId' : 'prevId';
    const nextSongId =
      state.repeatMode === 'ONE' && !force
        ? currentSong.id
        : currentSong[nextSongKey] ??
          (state.repeatMode === 'ALL'
            ? state.items.find(item => !item[prevSongKey])?.id ?? null
            : null);
    if (!nextSongId) return {};
    return setCurrentlyPlayingId(nextSongId);
  };
};

const playPrev = (
  force: boolean = false
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    const currentSong = state.items.find(
      item => item.id === state.currentlyPlayingId
    );
    if (!currentSong) return {};
    const nextSongKey = state.shuffle ? 'shuffledNextId' : 'nextId';
    const prevSongKey = state.shuffle ? 'shuffledPrevId' : 'prevId';
    const prevSongId =
      state.currentTime > 5 && !force
        ? state.currentlyPlayingId
        : currentSong[prevSongKey] ??
          (state.repeatMode === 'ALL'
            ? state.items.find(item => !item[nextSongKey])?.id ?? null
            : null);
    if (!prevSongId) return {};
    return setCurrentlyPlayingId(prevSongId);
  };
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
        prevId: item.prevId ?? null,
        nextId: item.nextId ?? null,
        songId: item.songId!,
        queueId: state.queueId!,
        shuffledNextId: null,
        shuffledPrevId: null,
      })),
      currentlyPlayingId: generateQueueItemId(
        state.queueId,
        songId ?? items[0].id,
        1
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
      prevId: item.prevId ?? null,
      nextId: item.nextId ?? null,
      songId: item.songId!,
      queueId: state.queueId!,
      shuffledNextId: null,
      shuffledPrevId: null,
    }));
    const newCurrentlyPlayingId = generateQueueItemId(state.queueId!, song, 1);
    if (state.items.length) {
      const sortedOldItems = sortLinkedList(state.items);
      const isSameState =
        newItems.every(
          (item, index) => item.songId === sortedOldItems[index].songId
        ) && state.currentlyPlayingId === newCurrentlyPlayingId;
      if (isSameState) return { isPlaying: true };
    }
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
      currentlyPlayingId: newCurrentlyPlayingId,
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
    const currentSong = state.items.find(
      item => item.id === state.currentlyPlayingId
    );
    let shuffled = [...state.items];
    if (shuffle) {
      shuffled = shuffled.filter(item => item.id !== state.currentlyPlayingId);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (currentSong) shuffled.unshift(currentSong);
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

const reorderItems = (
  reorderedItems: QueueItem[],
  prevId: QueueItemId | null,
  nextId: QueueItemId | null,
  newOrder: QueueItem[]
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    fetch(`/api/queue/reorder`, {
      method: 'POST',
      body: JSON.stringify({
        songIds: reorderedItems.map(item => item.songId),
        prevId,
        nextId,
      }),
    });
    const newItems = createQueueItems(
      newOrder.map(item => item.songId),
      state.queueId!
    ).map((item, index) => ({
      id: item.id!,
      prevId: state.shuffle ? newOrder[index].prevId ?? null : item.prevId!,
      nextId: state.shuffle ? newOrder[index].nextId ?? null : item.nextId!,
      songId: item.songId!,
      queueId: state.queueId!,
      shuffledNextId: state.shuffle ? item.nextId! : null,
      shuffledPrevId: state.shuffle ? item.prevId! : null,
    }));
    return {
      items: newItems,
    };
  };
};

const addSongToQueue = (
  songId: SongId
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    if (!state.queueId) {
      throw new Error('Must be logged in to add songs to queue');
    }
    fetch(`/api/queue/add`, {
      method: 'POST',
      body: JSON.stringify({
        songId,
      }),
    });
    const sortedItems = sortLinkedList(state.items, null, state.shuffle);
    const count = sortedItems.filter(item => item.songId === songId).length;
    const newQueueItemId = generateQueueItemId(
      state.queueId,
      songId,
      count + 1
    );
    const prevItem = sortedItems.find(item => !item.nextId);
    if (prevItem) prevItem.nextId = newQueueItemId;
    const prevShuffledItem = state.shuffle
      ? sortedItems.find(item => !item.shuffledNextId)
      : null;
    if (prevShuffledItem) prevShuffledItem.shuffledNextId = newQueueItemId;
    sortedItems.push({
      id: newQueueItemId,
      prevId: prevItem?.id ?? null,
      nextId: null,
      songId,
      queueId: state.queueId,
      shuffledNextId: null,
      shuffledPrevId: state.shuffle ? prevShuffledItem?.id ?? null : null,
    });
    return {
      items: sortedItems,
    };
  };
};

const removeSongFromQueue = (
  queueItemId: QueueItemId
): ((state: QueueState) => Partial<QueueState>) => {
  return state => {
    if (!state.queueId) {
      throw new Error('Must be logged in to remove songs from queue');
    }
    fetch(`/api/queue/remove`, {
      method: 'POST',
      body: JSON.stringify({
        queueItemId,
      }),
    });
    const nextIdKey = state.shuffle ? 'shuffledNextId' : 'nextId';
    const prevIdKey = state.shuffle ? 'shuffledPrevId' : 'prevId';
    const prevItem = state.items.find(item => item[nextIdKey] === queueItemId);
    const nextItem = state.items.find(item => item[prevIdKey] === queueItemId);
    const newItems = state.items
      .filter(item => item.id !== queueItemId)
      .map(item => {
        if (item.id === prevItem?.id) {
          return {
            ...item,
            [nextIdKey]: nextItem?.id ?? null,
          };
        }
        if (item.id === nextItem?.id) {
          return {
            ...item,
            [prevIdKey]: prevItem?.id ?? null,
          };
        }
        return item;
      });
    return {
      items: newItems,
    };
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
  reorderItems,
  addSongToQueue,
  removeSongFromQueue,
};
