import { Prisma } from '@prisma/client';
import { SongId } from '../songs';

export const generateQueueItemId = (
  queueId: string,
  songId: SongId,
  count: number
) => {
  return `${queueId}-${count}-${songId}`;
};

export const createQueueItems = (
  songs: SongId[],
  queueId: string,
  countsMap: Map<SongId, number> = new Map<SongId, number>()
): Prisma.QueueItemCreateManyQueueInput[] => {
  const items = songs.map(song => {
    const count = (countsMap.get(song) ?? 0) + 1;
    countsMap.set(song, count);
    return {
      id: generateQueueItemId(queueId, song, count),
      songId: song,
    };
  });
  return items.map((item, index) => ({
    ...item,
    nextId: songs.length === index + 1 ? null : items[index + 1].id!,
    prevId: index === 0 ? null : items[index - 1].id!,
  }));
};
