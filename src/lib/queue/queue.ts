import { Session } from 'next-auth';
import { prisma } from '../database';
import {
  BadRequestError,
  LinkedList,
  NotFoundError,
  checkLinkedListNodesAreInOrder,
  checkLinkedListsAreEqual,
  sortLinkedList,
} from '@/utils';
import {
  ClearQueueProps,
  DeleteQueueProps,
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

export const getQueue = async (session: Session) => {
  return await prisma.queue.upsert({
    where: {
      id: session.user.id,
    },
    update: {},
    create: {
      id: session.user.id,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};

export const playPlaylist = async ({
  session,
  playlistId,
  currentSongId,
}: PlayPlaylistProps): Promise<Queue> => {
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
        currentSongId ?? songIds[0]
      ),
      items: {
        deleteMany: {},
        createMany: {
          data: createQueueItems(songIds, session.user.id),
        },
      },
      playlistId,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};

export const playSong = async ({
  session,
  songId,
  songIds,
}: PlaySongProps): Promise<Queue> => {
  const { items } = await getQueue(session);
  const newItems = createQueueItems(songIds, session.user.id);
  const newCurrentlyPlayingId = generateQueueItemId(session.user.id, songId);
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
      playlistId: null,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};

export const updateCurrentSongInQueue = async ({
  session,
  currentQueueItemId,
}: UpdateCurrentSongInQueueProps): Promise<Queue> => {
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: {
      currentlyPlayingId: currentQueueItemId,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};

export const insertSongsToQueue = async ({
  session,
  songs,
}: InsertSongsToQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { id, items } = queue;
  const lastItem = items.find(item => !item.nextId);
  const newItems = createQueueItems(songs, id);
  newItems[0].prevId = lastItem?.id;
  await prisma.$transaction([
    prisma.queueItem.update({
      where: {
        id: lastItem?.id,
      },
      data: {
        nextId: newItems[0].id,
      },
    }),
    prisma.queue.update({
      where: { id },
      data: {
        items: {
          createMany: {
            data: newItems,
          },
        },
      },
    }),
  ]);
  if (queue.shuffle) {
    return await updateQueueSettings({
      session,
      isShuffled: true,
      newOrder: [
        ...sortLinkedList(items, null, true).map(item => item.id),
        ...songs,
      ],
    });
  }
  return await getQueue(session);
};

export const removeSongsFromQueue = async ({
  session,
  songIds,
}: RemoveSongsFromQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { items, shuffle } = queue;
  const songsToRemove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError(`Song ${songId} not found in queue`);
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
  await prisma.$transaction([
    prisma.queueItem.deleteMany({
      where: {
        id: {
          in: songIds,
        },
      },
    }),
    prisma.queueItem.update({
      where: {
        id: prevItem?.id,
      },
      data: {
        [nextIdKey]: nextItem?.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: nextItem?.id,
      },
      data: {
        [prevIdKey]: prevItem?.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: otherPrevItem?.id,
      },
      data: {
        [otherNextidKey]: otherNextItem?.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: otherNextItem?.id,
      },
      data: {
        [otherPrevIdKey]: otherPrevItem?.id,
      },
    }),
  ]);
  return await getQueue(session);
};

export const moveSongsInQueue = async ({
  session,
  songIds,
  nextId,
  prevId,
}: MoveSongsInQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { items, shuffle } = queue;
  const songsToMove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError(`Song ${songId} not found in queue`);
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
    (newPrevItem && newPrevItem[nextIdKey] !== newNextItem?.id) ||
    (newNextItem && newNextItem[prevIdKey] !== newPrevItem?.id)
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
    prisma.queueItem.update({
      where: {
        id: newPrevItem?.id,
      },
      data: {
        [nextIdKey]: firstItem.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: newNextItem?.id,
      },
      data: {
        [prevIdKey]: lastItem.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldPrevItem?.id,
      },
      data: {
        [nextIdKey]: lastItem[nextIdKey],
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldNextItem?.id,
      },
      data: {
        [prevIdKey]: firstItem[prevIdKey],
      },
    }),
  ]);
  return await getQueue(session);
};

export const clearQueue = async ({
  session,
}: ClearQueueProps): Promise<Queue> => {
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: { items: { deleteMany: {} } },
    include: {
      playlist: true,
      items: true,
    },
  });
};

export const deleteQueue = async ({
  session,
}: DeleteQueueProps): Promise<void> => {
  await prisma.queue.delete({
    where: {
      id: session.user.id,
    },
  });
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
    sortedItems = newOrder.map((songId, index) => {
      const item = sortedItems.find(item => item.songId === songId);
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
      playlist: true,
      items: true,
    },
  });
};
