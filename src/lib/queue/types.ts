import { RepeatMode, Song } from '@prisma/client';
import { Session } from 'next-auth';
import { getQueue } from './queue';
import { SongId } from '../songs';

export type QueueItemId = string;

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
  currentSongId: SongId;
};

export type InsertSongsToQueueProps = {
  session: Session;
  songs: SongId[];
};

export type RemoveSongsFromQueueProps = {
  session: Session;
  songIds: SongId[];
};

export type MoveSongsInQueueProps = {
  session: Session;
  songIds: SongId[];
  nextId: QueueItemId | null;
  prevId: QueueItemId | null;
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
