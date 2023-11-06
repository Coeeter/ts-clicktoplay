import { Playlist } from '@/actions/playlist';
import { Queue, QueueItemId } from '@/actions/queue';
import { SongId } from '@/actions/songs';
import { QueueItem, RepeatMode } from '@prisma/client';

export type QueueState = Omit<Queue, 'id'> & {
  queueId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
};

export type QueueActions = {
  setQueue: (queue: Queue) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  playNext: (force?: boolean) => void;
  playPrev: (force?: boolean) => void;
  playPlaylist: (playlist: Playlist, songId: SongId | null) => void;
  playSong: (song: SongId, songs: SongId[]) => void;
  setCurrentlyPlayingId: (currentlyPlayingId: string) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: RepeatMode) => void;
  resetState: () => void;
  reorderItems: (
    reorderedItems: QueueItem[],
    prevId: QueueItemId | null,
    nextId: QueueItemId | null,
    newOrder: QueueItem[]
  ) => void;
  addSongToQueue: (songId: SongId) => void;
  removeSongFromQueue: (queueItemId: QueueItemId) => void;
  setNextSong: (songId: SongId, path: string) => void;
};
