import { RepeatMode } from '@prisma/client';
import { z } from 'zod';
import { songIdSchema } from './song';

const queueItemIdSchema = z
  .string({
    required_error: 'Queue item ID is required',
  })
  .refine(
    value => {
      if (!value) return false;
      const parts = value.split('-');
      return (
        parts.length === 3 &&
        z.string().cuid().safeParse(parts[0]).success &&
        z.string().cuid().safeParse(parts[2]).success &&
        !isNaN(parseInt(parts[1]))
      );
    },
    {
      message: 'Queue item ID is invalid',
    }
  );

export const insertSongsToQueueSchema = z.object({
  songId: songIdSchema,
});

export const playSongSchema = z.object({
  songId: songIdSchema,
  songs: z.array(songIdSchema).min(1),
});

export const playPlaylistSchema = z.object({
  songId: songIdSchema,
  playlistId: z.string().cuid({
    message: 'Playlist ID is invalid',
  }),
});

export const removeSongsFromQueueSchema = z.object({
  queueItemId: queueItemIdSchema,
});

export const moveSongsInQueueSchema = z
  .object({
    queueItemIds: z.array(queueItemIdSchema).min(1),
    nextId: z.string().nullable(),
    prevId: z.string().nullable(),
  })
  .refine(
    data => {
      if (data.nextId === null && data.prevId === null) return false;
      return data.nextId !== data.prevId;
    },
    {
      message: 'Invalid Next/Prev IDs',
    }
  );

export const repeatModeSchema = z.nativeEnum(RepeatMode, {
  required_error: 'Repeat mode is required',
  invalid_type_error: 'Repeat mode is invalid',
});

export const updateRepeatModeSchema = z.object({
  repeatMode: repeatModeSchema,
});

export const shuffleSchema = z.object({
  shuffle: z.boolean(),
  newItems: z.array(songIdSchema).min(1),
});

export const updateCurrentlyPlayingSongSchema = z.object({
  currentlyPlayingId: queueItemIdSchema,
});
