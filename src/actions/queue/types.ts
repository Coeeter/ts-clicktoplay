import { RepeatMode } from '@prisma/client';
import { Session } from 'next-auth';
import { getQueue } from './queue';
import { SongId } from '../songs';

export type QueueItemId = string;

export type Queue = Awaited<ReturnType<typeof getQueue>>;

export type PlayPlaylistProps = {
  session: Session;
  playlistId: string;
  currentSongId?: SongId;
};

export type PlaySongProps = {
  session: Session;
  songId: SongId;
  songIds: SongId[];
};

export type UpdateCurrentSongInQueueProps = {
  session: Session;
  currentQueueItemId: QueueItemId;
};

export type InsertSongsToQueueProps = {
  session: Session;
  songs: SongId[];
};

export type RemoveSongsFromQueueProps = {
  session: Session;
  queueItemIds: QueueItemId[];
};

export type MoveSongsInQueueProps = {
  session: Session;
  queueItemIds: QueueItemId[];
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
