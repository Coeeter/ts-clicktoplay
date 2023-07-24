import { RepeatMode, Song } from '@prisma/client';
import { Session } from 'next-auth';
import { getQueue } from './queue';

export type SongId = string;

export type Queue = Awaited<ReturnType<typeof getQueue>>;

export type CreateQueueProps =
  | {
      type: 'search';
      session: Session;
      currentSongId: SongId;
      songs: Song[];
      search?: string;
    }
  | {
      type: 'playlist';
      session: Session;
      currentSongId: SongId | null | undefined;
      playlistId: string;
    };

export type UpdateCurrentSongInQueueProps = {
  session: Session;
  currentSongId: string;
};

export type InsertSongsToQueueProps = {
  session: Session;
  songs: SongId[];
};

export type RemoveSongFromQueueProps = {
  session: Session;
  songId: string;
};

export type MoveSongInQueueProps = {
  session: Session;
  songId: string;
  nextId: string | null;
  prevId: string | null;
};

export type ClearQueueProps = {
  session: Session;
};

export type DeleteQueueProps = {
  session: Session;
};

export type UpdateQueueSettingsProps = {
  session: Session;
  isShuffled?: boolean;
  repeatMode?: RepeatMode;
  newOrder?: SongId[];
};
