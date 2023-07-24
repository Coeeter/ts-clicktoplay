import { Prisma } from '@prisma/client';
import { SongId } from './types';

export const generateQueueItemId = (queueId: string, songId: string) => {
  return `${queueId}-${songId}`;
};

export const createQueueItems = (
  songs: SongId[],
  queueId: string
): Prisma.QueueItemCreateManyQueueInput[] => {
  return songs.map((song, index) => ({
    id: generateQueueItemId(queueId, song),
    songId: song,
    nextId:
      songs.length === index + 1
        ? null
        : generateQueueItemId(queueId, songs[index + 1]),
    prevId: index === 0 ? null : generateQueueItemId(queueId, songs[index - 1]),
  }));
};
