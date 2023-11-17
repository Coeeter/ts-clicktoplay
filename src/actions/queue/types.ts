import { RepeatMode } from '@prisma/client';
import { getQueue } from './queue';
import { SongId } from '../songs';
import { AuthSession } from '@/lib/auth';

export type QueueItemId = string;

export type Queue = Awaited<ReturnType<typeof getQueue>>;

export type PlayPlaylistProps = {
  session: AuthSession;
  playlistId: string;
  currentSongId?: SongId;
};

export type PlaySongProps = {
  session: AuthSession;
  songId: SongId;
  songIds: SongId[];
};

export type UpdateCurrentSongInQueueProps = {
  session: AuthSession;
  currentQueueItemId: QueueItemId;
};

export type InsertSongsToQueueProps = {
  session: AuthSession;
  songs: SongId[];
};

export type RemoveSongsFromQueueProps = {
  session: AuthSession;
  queueItemIds: QueueItemId[];
};

export type MoveSongsInQueueProps = {
  session: AuthSession;
  queueItemIds: QueueItemId[];
  nextId: QueueItemId | null;
  prevId: QueueItemId | null;
};

export type ClearQueueProps = {
  session: AuthSession;
};

export type DeleteQueueProps = {
  session: AuthSession;
};

export type UpdateQueueSettingsProps = {
  session: AuthSession;
  isShuffled?: boolean;
  repeatMode?: RepeatMode;
  newOrder?: SongId[];
};
