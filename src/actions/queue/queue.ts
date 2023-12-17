'use server';
import { prisma } from '../../lib/database';
import {
  BadRequestError,
  LinkedList,
  NotFoundError,
  checkLinkedListNodesAreInOrder,
  checkLinkedListsAreEqual,
  sortLinkedList,
} from '@/utils';
import {
  InsertSongsToQueueProps,
  MoveSongsInQueueProps,
  PlayPlaylistProps,
  PlaySongProps,
  Queue,
  RemoveSongsFromQueueProps,
  UpdateCurrentSongInQueueProps,
  UpdateQueueSettingsProps,
} from './types';
import { createQueueItems, generateQueueItemId } from './helper';
import { AuthSession, getServerSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const getQueue = async (session: AuthSession) => {
  return await prisma.queue.upsert({
    where: {
      id: session.user.id,
    },
    update: {},
    create: {
      id: session.user.id,
    },
    include: {
      items: true,
    },
  });
};

export const addPlayHistory = async ({ session }: { session: AuthSession }) => {
  const { currentlyPlayingId, items } = await getQueue(session);
  const currentlyPlayingItem = items.find(
    item => item.id === currentlyPlayingId
  );
  if (!currentlyPlayingItem) return;
  const song = await prisma.song.findUnique({
    where: {
      id: currentlyPlayingItem.songId,
    },
  });
  if (!song) return;
  await prisma.playHistory.create({
    data: {
      userId: session.user.id,
      songId: currentlyPlayingItem.songId,
      playlistId: currentlyPlayingItem.playlistId,
      artistId: song.artistIds[0],
    },
  });
};

export const playPlaylist = async ({
  session,
  playlistId,
  currentSongId,
}: PlayPlaylistProps): Promise<Queue> => {
  await addPlayHistory({ session });
  const playlist = await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
    include: {
      items: true,
    },
  });
  if (!playlist) {
    throw new NotFoundError('Playlist not found');
  }
  const songIds = sortLinkedList(playlist.items).map(item => item.songId);
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: {
      currentlyPlayingId: generateQueueItemId(
        session.user.id,
        currentSongId ?? songIds[0],
        1
      ),
      items: {
        deleteMany: {},
        createMany: {
          data: createQueueItems(songIds, session.user.id).map(item => ({
            ...item,
            playlistId,
          })),
        },
      },
    },
    include: {
      items: true,
    },
  });
};

export const playSong = async ({
  session,
  songId,
  songIds,
}: PlaySongProps): Promise<Queue> => {
  await addPlayHistory({ session });
  const { items } = await getQueue(session);
  const newItems = createQueueItems(songIds, session.user.id);
  const newCurrentlyPlayingId = generateQueueItemId(session.user.id, songId, 1);
  if (checkLinkedListsAreEqual(items, newItems as LinkedList, false)) {
    return await updateCurrentSongInQueue({
      session,
      currentQueueItemId: newCurrentlyPlayingId,
    });
  }
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: {
      currentlyPlayingId: newCurrentlyPlayingId,
      items: {
        deleteMany: {},
        createMany: {
          data: newItems,
        },
      },
    },
    include: {
      items: true,
    },
  });
};

export const updateCurrentSongInQueue = async ({
  session,
  currentQueueItemId,
}: UpdateCurrentSongInQueueProps): Promise<Queue> => {
  await addPlayHistory({ session });
  const { items } = await getQueue(session);
  const currentItem = items.find(item => item.id === currentQueueItemId);
  if (!currentItem) {
    throw new NotFoundError('Song not found in queue');
  }
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: {
      currentlyPlayingId: currentItem.id,
    },
    include: {
      items: true,
    },
  });
};

export const insertSongsToQueue = async ({
  session,
  songs,
  playlistId,
  start,
}: InsertSongsToQueueProps & {
  playlistId?: string;
  start?: string | null;
}): Promise<Queue> => {
  const queue = await getQueue(session);
  const { id, items, shuffle } = queue;
  const lastItem = start
    ? items.find(item => item.id === start)
    : items.find(item => !item.nextId);
  const shuffledLastItem = shuffle
    ? start
      ? items.find(item => item.id === start)
      : items.find(item => !item.shuffledNextId)
    : undefined;
  const counts = new Map<string, number>();
  items.forEach(item => {
    const count = counts.get(item.songId) ?? 0;
    counts.set(item.songId, count + 1);
  });
  const newItems = createQueueItems(songs, id, counts).map(item => ({
    ...item,
    ...(shuffle
      ? { shuffledNextId: item.nextId, shuffledPrevId: item.prevId }
      : {}),
  }));
  newItems[0].prevId = lastItem?.id ?? null;
  newItems[0].shuffledPrevId = shuffledLastItem?.id ?? null;
  newItems[newItems.length - 1].nextId = start
    ? lastItem?.nextId ?? null
    : null;
  newItems[newItems.length - 1].shuffledNextId = start
    ? shuffledLastItem?.shuffledNextId ?? null
    : null;
  await prisma.$transaction([
    ...(lastItem
      ? [
          prisma.queueItem.update({
            where: { id: lastItem.id },
            data: { nextId: newItems[0].id },
          }),
        ]
      : []),
    ...(shuffle && shuffledLastItem
      ? [
          prisma.queueItem.update({
            where: {
              id: shuffledLastItem?.id,
            },
            data: {
              shuffledNextId: newItems[0].id,
            },
          }),
        ]
      : []),
    ...(start && lastItem?.nextId
      ? [
          prisma.queueItem.update({
            where: { id: lastItem?.nextId },
            data: {
              prevId: newItems[newItems.length - 1].id,
            },
          }),
        ]
      : []),
    ...(shuffle && start && shuffledLastItem?.shuffledNextId
      ? [
          prisma.queueItem.update({
            where: {
              id: shuffledLastItem?.shuffledNextId,
            },
            data: {
              shuffledPrevId: newItems[newItems.length - 1].id,
            },
          }),
        ]
      : []),
    prisma.queue.update({
      where: { id },
      data: {
        items: {
          createMany: {
            data: newItems.map(item => ({
              ...item,
              playlistId: playlistId ?? undefined,
            })),
          },
        },
      },
    }),
  ]);
  return await getQueue(session);
};

export const addNextSongToQueue = async ({
  songId,
  path,
}: {
  songId: string;
  path: string;
}) => {
  const session = await getServerSession();
  if (!session) return;
  const queue = await insertSongsToQueue({
    session,
    songs: [songId],
    start: (await getQueue(session)).currentlyPlayingId,
  });
  revalidatePath(path);
  return queue;
};

export const playArtistNext = async (artistId: string, path: string) => {
  const session = await getServerSession();
  if (!session) return;
  const songs = await prisma.song.findMany({
    where: {
      artistIds: {
        has: artistId,
      },
    },
    select: {
      id: true,
    },
  });
  if (!songs) return;
  const queue = await insertSongsToQueue({
    session,
    songs: songs.map(song => song.id),
    start: (await getQueue(session)).currentlyPlayingId,
  });
  revalidatePath(path);
  return queue;
};

export const addNextPlaylistToQueue = async (
  playlistId: string,
  path: string
) => {
  const session = await getServerSession();
  if (!session) return;
  const playlist = await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
    include: {
      items: true,
    },
  });
  if (!playlist) return;
  const queue = await insertSongsToQueue({
    session,
    songs: playlist.items.map(item => item.songId),
    playlistId: playlist.id,
    start: (await getQueue(session)).currentlyPlayingId,
  });
  revalidatePath(path);
  return queue;
};

export const playArtistLast = async (artistId: string, path: string) => {
  const session = await getServerSession();
  if (!session) return;
  const songs = await prisma.song.findMany({
    where: {
      artistIds: {
        has: artistId,
      },
    },
    select: {
      id: true,
    },
  });
  if (!songs.length) return;
  const result = await insertSongsToQueue({
    session,
    songs: songs.map(song => song.id),
  });
  revalidatePath(path);
  return result;
};

export const insertPlaylistToBackOfQueue = async (
  playlistId: string,
  path: string
) => {
  const session = await getServerSession();
  if (!session) return;
  const playlist = await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
    include: {
      items: true,
    },
  });
  if (!playlist) return;
  const result = await insertSongsToQueue({
    session,
    songs: playlist.items.map(item => item.songId),
    playlistId: playlist.id,
  });
  revalidatePath(path);
  return result;
};

export const removeSongsFromQueue = async ({
  session,
  queueItemIds,
}: RemoveSongsFromQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { items, shuffle } = queue;
  const songsToRemove = queueItemIds.map(id => {
    const item = items.find(i => i.id === id);
    if (!item) {
      throw new NotFoundError(`Queue Item ${id} not found in queue`);
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(songsToRemove, true, null, shuffle)) {
    throw new BadRequestError('Invalid songIds');
  }
  const nextIdKey = shuffle ? 'shuffledNextId' : 'nextId';
  const prevIdKey = shuffle ? 'shuffledPrevId' : 'prevId';
  const otherNextidKey = shuffle ? 'nextId' : 'shuffledNextId';
  const otherPrevIdKey = shuffle ? 'prevId' : 'shuffledPrevId';
  const firstItem = songsToRemove[0];
  const lastItem = songsToRemove[songsToRemove.length - 1];
  const prevItem = items.find(item => firstItem[prevIdKey] === item.id);
  const nextItem = items.find(item => lastItem[nextIdKey] === item.id);
  const otherPrevItem = items.find(
    item => firstItem[otherPrevIdKey] === item.id
  );
  const otherNextItem = items.find(
    item => lastItem[otherNextidKey] === item.id
  );
  const transaction: any[] = [
    prisma.queueItem.deleteMany({
      where: {
        id: {
          in: queueItemIds,
        },
      },
    }),
  ];
  if (prevItem) {
    transaction.push(
      prisma.queueItem.update({
        where: {
          id: prevItem?.id,
        },
        data: {
          [nextIdKey]: nextItem?.id ?? null,
        },
      })
    );
  }
  if (nextItem) {
    transaction.push(
      prisma.queueItem.update({
        where: {
          id: nextItem?.id,
        },
        data: {
          [prevIdKey]: prevItem?.id ?? null,
        },
      })
    );
  }
  if (otherPrevItem) {
    transaction.push(
      prisma.queueItem.update({
        where: {
          id: otherPrevItem?.id,
        },
        data: {
          [otherNextidKey]: otherNextItem?.id ?? null,
        },
      })
    );
  }
  if (otherNextItem) {
    transaction.push(
      prisma.queueItem.update({
        where: {
          id: otherNextItem?.id,
        },
        data: {
          [otherPrevIdKey]: otherPrevItem?.id ?? null,
        },
      })
    );
  }
  await prisma.$transaction(transaction);
  return await getQueue(session);
};

export const moveSongsInQueue = async ({
  session,
  queueItemIds,
  nextId,
  prevId,
}: MoveSongsInQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { items, shuffle } = queue;
  const songsToMove = queueItemIds.map(id => {
    const item = items.find(item => item.id === id);
    if (!item) {
      throw new NotFoundError(`Queue Item ${id} not found in queue`);
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(songsToMove, true, null, shuffle)) {
    throw new BadRequestError('Invalid songIds');
  }
  const prevIdKey = shuffle ? 'shuffledPrevId' : 'prevId';
  const nextIdKey = shuffle ? 'shuffledNextId' : 'nextId';
  const firstItem = songsToMove[0];
  const lastItem = songsToMove[songsToMove.length - 1];
  const oldPrevItem = items.find(item => firstItem[prevIdKey] === item.id);
  const oldNextItem = items.find(item => lastItem[nextIdKey] === item.id);
  const newPrevItem = items.find(item => prevId === item.id);
  const newNextItem = items.find(item => nextId === item.id);
  if (!prevId && !nextId) {
    throw new BadRequestError('nextId or prevId is required');
  }
  if (prevId && !newPrevItem) {
    throw new NotFoundError('prevId not found in queue');
  }
  if (nextId && !newNextItem) {
    throw new NotFoundError('nextId not found in queue');
  }
  if (
    (newPrevItem && newPrevItem[nextIdKey] !== (newNextItem?.id ?? null)) ||
    (newNextItem && newNextItem[prevIdKey] !== (newPrevItem?.id ?? null))
  ) {
    throw new BadRequestError('Invalid nextId or prevId');
  }
  await prisma.$transaction([
    prisma.queueItem.update({
      where: {
        id: firstItem.id,
      },
      data: {
        [prevIdKey]: prevId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: lastItem.id,
      },
      data: {
        [nextIdKey]: nextId,
      },
    }),
    ...(newPrevItem
      ? [
          prisma.queueItem.update({
            where: {
              id: newPrevItem.id,
            },
            data: {
              [nextIdKey]: firstItem.id,
            },
          }),
        ]
      : []),
    ...(newNextItem
      ? [
          prisma.queueItem.update({
            where: {
              id: newNextItem.id,
            },
            data: {
              [prevIdKey]: lastItem.id,
            },
          }),
        ]
      : []),
    ...(oldPrevItem
      ? [
          prisma.queueItem.update({
            where: {
              id: oldPrevItem.id,
            },
            data: {
              [nextIdKey]: lastItem[nextIdKey],
            },
          }),
        ]
      : []),
    ...(oldNextItem
      ? [
          prisma.queueItem.update({
            where: {
              id: oldNextItem?.id,
            },
            data: {
              [prevIdKey]: firstItem[prevIdKey],
            },
          }),
        ]
      : []),
  ]);
  return await getQueue(session);
};

export const updateQueueSettings = async ({
  session,
  isShuffled,
  repeatMode,
  newOrder,
}: UpdateQueueSettingsProps): Promise<Queue> => {
  const { id, items, shuffle, repeatMode: repeat } = await getQueue(session);
  let sortedItems: Queue['items'] = sortLinkedList(items).map(item => ({
    ...item,
    shuffledNextId: null,
    shuffledPrevId: null,
  }));
  if (isShuffled === true) {
    if (!newOrder) {
      throw new BadRequestError('newOrder is required');
    }
    if (newOrder.length !== sortedItems.length) {
      throw new BadRequestError('newOrder length must match queue length');
    }
    const countMap = new Map<string, number>();
    sortedItems = newOrder.map((songId, index) => {
      const count = (countMap.get(songId) ?? 0) + 1;
      countMap.set(songId, count);
      const item = sortedItems.find(
        item => item.id === generateQueueItemId(id, songId, count)
      );
      if (!item) {
        throw new BadRequestError('Invalid newOrder');
      }
      const nextItemId =
        index === newOrder.length - 1
          ? null
          : sortedItems.find(item => item.songId === newOrder[index + 1])?.id ??
            'Invalid';
      if (nextItemId === 'Invalid') {
        throw new BadRequestError('Invalid newOrder');
      }
      const prevItemId =
        index === 0
          ? null
          : sortedItems.find(item => item.songId === newOrder[index - 1])?.id ??
            'Invalid';
      if (prevItemId === 'Invalid') {
        throw new BadRequestError('Invalid newOrder');
      }
      return {
        ...item,
        shuffledNextId: nextItemId,
        shuffledPrevId: prevItemId,
      };
    });
  }
  return await prisma.queue.update({
    where: { id },
    data: {
      ...(isShuffled === undefined
        ? {}
        : {
            items: {
              deleteMany: {},
              createMany: {
                data: sortedItems.map(item => ({
                  ...item,
                  queueId: undefined,
                })),
              },
            },
          }),
      shuffle: isShuffled === undefined ? shuffle : isShuffled,
      repeatMode: repeatMode ?? repeat,
    },
    include: {
      items: true,
    },
  });
};
