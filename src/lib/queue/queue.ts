import { Session } from 'next-auth';
import { prisma } from '../database';
import {
  BadRequestError,
  NotFoundError,
  checkLinkedListNodesAreInOrder,
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
  const queue = await prisma.queue.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
  if (!queue) {
    return await prisma.queue.create({
      data: {
        id: session.user.id,
      },
      include: {
        playlist: true,
        items: true,
      },
    });
  }
  return queue;
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
        create: createQueueItems(songIds, session.user.id),
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
  return await prisma.queue.update({
    where: {
      id: session.user.id,
    },
    data: {
      currentlyPlayingId: generateQueueItemId(session.user.id, songId),
      items: {
        deleteMany: {},
        create: createQueueItems(songIds, session.user.id),
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
  currentSongId,
}: UpdateCurrentSongInQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { id, items } = queue;
  const currentlyPlayingId = items.find(
    item => item.songId === currentSongId
  )?.id;
  if (!currentlyPlayingId) {
    throw new NotFoundError('Song not found in queue');
  }
  return await prisma.queue.update({
    where: { id },
    data: { currentlyPlayingId },
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
          create: newItems,
        },
      },
    }),
  ]);
  return await getQueue(session);
};

export const removeSongsFromQueue = async ({
  session,
  songIds,
}: RemoveSongsFromQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  const { items } = queue;
  const songsToRemove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError(`Song ${songId} not found in queue`);
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(songsToRemove, true)) {
    throw new BadRequestError('Invalid songIds');
  }
  const firstItem = songsToRemove[0];
  const lastItem = songsToRemove[songsToRemove.length - 1];
  const prevItem = items.find(item => firstItem.prevId === item.id);
  const nextItem = items.find(item => lastItem.nextId === item.id);
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
        nextId: nextItem?.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: nextItem?.id,
      },
      data: {
        prevId: prevItem?.id,
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
  const { items } = queue;
  const songsToMove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError(`Song ${songId} not found in queue`);
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(songsToMove, true)) {
    throw new BadRequestError('Invalid songIds');
  }
  const firstItem = songsToMove[0];
  const lastItem = songsToMove[songsToMove.length - 1];
  const oldPrevItem = items.find(item => firstItem?.prevId === item.id);
  const oldNextItem = items.find(item => lastItem.nextId === item.id);
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
    (newPrevItem && newPrevItem?.nextId !== newNextItem?.id) ||
    (newNextItem && newNextItem?.prevId !== newPrevItem?.id)
  ) {
    throw new BadRequestError('Invalid nextId or prevId');
  }
  await prisma.$transaction([
    prisma.queueItem.update({
      where: {
        id: firstItem.id,
      },
      data: {
        prevId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: lastItem.id,
      },
      data: {
        nextId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: newPrevItem?.id,
      },
      data: {
        nextId: firstItem.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: newNextItem?.id,
      },
      data: {
        prevId: lastItem.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldPrevItem?.id,
      },
      data: {
        nextId: lastItem.nextId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldNextItem?.id,
      },
      data: {
        prevId: firstItem.prevId,
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
  const queue = await getQueue(session);
  const { id, items } = queue;
  let sortedItems = sortLinkedList(items);
  if (isShuffled) {
    if (!newOrder) {
      throw new BadRequestError('newOrder is required');
    }
    if (newOrder.length !== sortedItems.length) {
      throw new BadRequestError('newOrder length must match queue length');
    }
    sortedItems = newOrder.map(songId => {
      const item = sortedItems.find(item => item.songId === songId);
      if (!item) {
        throw new BadRequestError('Invalid newOrder');
      }
      return item;
    });
  }
  const newItems = createQueueItems(
    sortedItems.map(item => item.songId),
    id
  );
  return await prisma.queue.update({
    where: { id },
    data: {
      ...(isShuffled
        ? {
            items: {
              deleteMany: {},
              create: newItems,
            },
          }
        : {}),
      shuffle: isShuffled ?? queue.shuffle,
      repeatMode: repeatMode ?? queue.repeatMode,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};
