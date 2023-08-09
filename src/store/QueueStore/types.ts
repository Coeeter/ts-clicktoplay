import { Playlist } from "@/lib/playlist";
import { Queue } from "@/lib/queue";
import { SongId } from "@/lib/songs";
import { RepeatMode } from "@prisma/client";

export type QueueState = Omit<Queue, 'id' | 'playlist'> & {
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
