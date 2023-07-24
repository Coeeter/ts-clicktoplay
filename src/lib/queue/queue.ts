import { Session } from 'next-auth';
import { prisma } from '../database';
import { BadRequestError, NotFoundError, sortLinkedList } from '@/utils';
import {
  ClearQueueProps,
  CreateQueueProps,
  DeleteQueueProps,
  InsertSongsToQueueProps,
  MoveSongInQueueProps,
  Queue,
  RemoveSongFromQueueProps,
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
  return queue;
};

export const createQueue = async (props: CreateQueueProps): Promise<Queue> => {
  const { session, currentSongId } = props;
  const { type } = props;
  await prisma.queue.delete({
    where: {
      id: session.user.id,
    },
  });
  if (type === 'search') {
    const { search, songs } = props;
    return await prisma.queue.create({
      data: {
        id: session.user.id,
        currentlyPlayingId: generateQueueItemId(
          session.user.id,
          currentSongId!
        ),
        items: {
          create: createQueueItems(
            songs.map(song => song.id),
            session.user.id
          ),
        },
        search,
      },
      include: {
        playlist: true,
        items: true,
      },
    });
  }
  const { playlistId } = props;
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
  return await prisma.queue.create({
    data: {
      id: session.user.id,
      currentlyPlayingId: generateQueueItemId(
        session.user.id,
        currentSongId ?? songIds[0]
      ),
      items: {
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

export const updateCurrentSongInQueue = async ({
  session,
  currentSongId,
}: UpdateCurrentSongInQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
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
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
  const { id, items } = queue;
  const lastItem = items.find(item => !item.nextId)!;
  const newItems = createQueueItems(songs, id);
  newItems[0].prevId = lastItem.id;
  await prisma.$transaction([
    prisma.queueItem.update({
      where: {
        id: lastItem.id,
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

export const removeSongFromQueue = async ({
  session,
  songId,
}: RemoveSongFromQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
  const { items } = queue;
  const songToRemove = items.find(item => item.songId === songId);
  if (!songToRemove) {
    throw new NotFoundError('Song not found in queue');
  }
  const prevItem = items.find(item => songToRemove.prevId === item.id);
  const nextItem = items.find(item => songToRemove.nextId === item.id);
  await prisma.$transaction([
    prisma.queueItem.delete({
      where: {
        id: songToRemove.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: prevItem?.id,
      },
      data: {
        nextId: songToRemove.nextId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: nextItem?.id,
      },
      data: {
        prevId: songToRemove.prevId,
      },
    }),
  ]);
  return await getQueue(session);
};

export const moveSongInQueue = async ({
  session,
  songId,
  nextId,
  prevId,
}: MoveSongInQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
  const { items } = queue;
  const songToMove = items.find(item => item.songId === songId);
  if (!songToMove) {
    throw new NotFoundError('Song not found in queue');
  }
  const oldPrevItem = items.find(item => songToMove.prevId === item.id);
  const oldNextItem = items.find(item => songToMove.nextId === item.id);
  const newPrevItem = items.find(item => prevId === item.id);
  const newNextItem = items.find(item => nextId === item.id);
  if (
    newPrevItem?.nextId !== newNextItem?.id ||
    newNextItem?.prevId !== newPrevItem?.id
  ) {
    throw new BadRequestError('Invalid nextId or prevId');
  }
  await prisma.$transaction([
    prisma.queueItem.update({
      where: {
        id: songToMove.id,
      },
      data: {
        nextId,
        prevId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: newPrevItem?.id,
      },
      data: {
        nextId: songToMove.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: newNextItem?.id,
      },
      data: {
        prevId: songToMove.id,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldPrevItem?.id,
      },
      data: {
        nextId: songToMove.nextId,
      },
    }),
    prisma.queueItem.update({
      where: {
        id: oldNextItem?.id,
      },
      data: {
        prevId: songToMove.prevId,
      },
    }),
  ]);
  return await getQueue(session);
};

export const clearQueue = async ({
  session,
}: ClearQueueProps): Promise<Queue> => {
  const queue = await getQueue(session);
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
  const { id } = queue;
  return await prisma.queue.update({
    where: { id },
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
  if (!queue) {
    throw new NotFoundError('Queue not found');
  }
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
      items: {
        deleteMany: {},
        create: newItems,
      },
      shuffle: isShuffled,
      repeatMode,
    },
    include: {
      playlist: true,
      items: true,
    },
  });
};
